/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const bodyParser = require('body-parser');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = 'dynamoc73ffc4d';
let profileTableName = 'UserProfile-d4itlx42uzhtrctybtkmaxruya-dev';

if (process.env.ENV && process.env.ENV !== 'NONE') {
  tableName = tableName + '-' + process.env.ENV;
}
const path = '/smileid-callback';

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch (type) {
    case 'N':
      return Number.parseInt(param);
    default:
      return param;
  }
};

/************************************
 * HTTP Get method to list objects *
 ************************************/

app.get(path, async function (req, res) {
  var params = {
    TableName: tableName,
    Select: 'ALL_ATTRIBUTES',
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json({ data: data.Items, tableName });
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: 'Could not load items: ' + err.message });
  }
});

app.post(path, async function (req, res) {
  const timestamp = new Date().toISOString();

  let putItemParams = {
    TableName: tableName,
    Item: {
      ...req.body,
      userId: req.body.PartnerParams.user_id,
      timestamp,
    },
  };
  try {
    let data = await ddbDocClient.send(new PutCommand(putItemParams));
    res.json({
      success: 'post call succeed!',
      url: req.url,
      data: data,
      body: req.body,
    });
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err, url: req.url, body: req.body });
  }
});

const saveUserNotification = async (notification) => {
  const timestamp = new Date().toISOString();
  const params = {
    TableName: userNotificationTableName,
    Item: {
      ...notification,
      _lastChangedAt: new Date().getTime(),
      _version: 1,
      __typename: 'UserNotifications',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
  } catch (err) {
    console.error('Error saving user notification:', err);
    throw new Error('Could not save user notification');
  }
};

// Helper function to get user profile by customer_code
const getUserProfile = async (customerCode) => {
  const params = {
    TableName: profileTableName,
    Key: { customer_code: customerCode },
  };

  try {
    const { Item: userProfile } = await ddbDocClient.send(
      new GetCommand(params)
    );
    return userProfile;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    throw new Error('Could not fetch user profile');
  }
};

// Route to handle Paystack webhook
app.post('/paystack-mimonie-hook', async (req, res) => {
  try {
    const { event: eventType, data: response } = req.body;
    const customerCode = response.customer_code;

    let isBvnVerified = false;
    let notificationTitle = '';
    let notificationContent = response.reason || '';

    // Handle Paystack verification success and failure events
    if (eventType === 'customeridentification.success') {
      isBvnVerified = true;
      notificationTitle = 'BVN Verified';
    } else if (eventType === 'customeridentification.failed') {
      isBvnVerified = false;
      notificationTitle = 'Verification Failed';
    } else {
      return res.status(400).json({ error: 'Unknown event type' });
    }

    // Fetch the user's profile to get userId
    const userProfile = await getUserProfile(customerCode);

    if (!userProfile || !userProfile.userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userProfile.userId;

    // Prepare DynamoDB update parameters for the profile table
    const updateParams = {
      TableName: profileTableName,
      Key: { customer_code: customerCode },
      UpdateExpression:
        'SET is_bvn_verified = :isBvnVerified, verification_in_progress = :verificationInProgress',
      ExpressionAttributeValues: {
        ':isBvnVerified': isBvnVerified,
        ':verificationInProgress': false, // Set to false as the verification process is complete
      },
      ReturnValues: 'UPDATED_NEW',
    };

    // Execute the update command to update user verification status
    const updateResponse = await ddbDocClient.send(
      new UpdateCommand(updateParams)
    );

    // Prepare notification details
    const notificationDetails = {
      id: uuidv4(),
      userId,
      type: 'verification',
      title: notificationTitle,
      read: false,
      content: notificationContent,
    };

    // Save the notification
    await saveUserNotification(notificationDetails);

    // Return success response
    res.json({
      success:
        'BVN verification status updated and notification saved successfully!',
      updatedAttributes: updateResponse.Attributes,
    });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(3000, function () {
  console.log('App started');
});

module.exports = app;
