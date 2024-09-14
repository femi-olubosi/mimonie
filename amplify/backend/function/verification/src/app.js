/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
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
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { v4: uuidv4 } = require('uuid');
// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

const ddbClient = new DynamoDBClient({ region: 'us-west-2' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

let profileTableName = 'UserProfile-d4itlx42uzhtrctybtkmaxruya-dev';
let userNotificationTableName =
  'UserNotifications-d4itlx42uzhtrctybtkmaxruya-dev';

/**********************
 * Example get method *
 **********************/
const PAYSTACK_SECRET_KEY_LIVE = process.env.PAYSTACK_SECRET_KEY_LIVE;

const https = require('https');

const makePaystackRequest = async (endpoint, method, data) => {
  const url = `https://api.paystack.co${endpoint}`;
  const headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY_LIVE}`,
    'Content-Type': 'application/json',
  };

  const options = {
    method,
    headers,
    hostname: 'api.paystack.co',
    path: endpoint,
    port: 443,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (!res.statusCode || res.statusCode >= 400) {
            throw new Error(result.message || 'Something went wrong');
          }
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (method === 'POST' || method === 'PUT') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

app.get('/mimonie-bvn-verification', function (req, res) {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url });
});

app.get('/mimonie-bvn-verification/*', function (req, res) {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url });
});

/****************************
 * Example post method *
 ****************************/

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
    FilterExpression: 'customer_code = :customerCode',
    ExpressionAttributeValues: {
      ':customerCode': customerCode,
    },
  };

  try {
    const { Items: userProfiles } = await ddbDocClient.send(
      new ScanCommand(params)
    );
    return userProfiles[0];
  } catch (err) {
    console.error('Error fetching user profile:', err);
    throw new Error('Could not fetch user profile');
  }
};

const createSubAccount = async (userProfile) => {
  const data = {
    business_name: `${userProfile.name}`,
    settlement_bank: userProfile.bank_details.bank_code,
    account_number: userProfile.bank_details.account_number,
    percentage_charge: 20,
  };

  return await makePaystackRequest('/subaccount', 'POST', data);
};

app.post('/mimonie-bvn-verification', async function (req, res) {
  const timestamp = new Date().toISOString();

  let putItemParams = {
    TableName: 'verification',
    Item: {
      ...req.body,
      customer_code: req.body.data.customer_code,
      timestamp,
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(putItemParams));

    const { event: eventType, data: response } = req.body;
    const customerCode = response.customer_code;

    let isBvnVerified = false;
    let notificationTitle = '';
    let notificationContent = response.reason || 'Verification Completed';

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

    // Create subaccount
    const subAcc = await createSubAccount(userProfile);

    if (!userProfile || !userProfile.userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userProfile.userId;

    // Prepare DynamoDB update parameters for the profile table, including subaccount_code
    const updateParams = {
      TableName: profileTableName,
      Key: { id: userProfile.id }, // Ensure 'id' is the primary key
      UpdateExpression:
        'SET is_bvn_verified = :isBvnVerified, verification_in_progress = :verificationInProgress, subaccount_code = :subaccountCode',
      ExpressionAttributeValues: {
        ':isBvnVerified': isBvnVerified,
        ':verificationInProgress': false,
        ':subaccountCode': subAcc.data.subaccount_code, // Update with subaccount_code
      },
      ReturnValues: 'UPDATED_NEW',
    };

    // Execute the update command to update user verification status and subaccount_code
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
      success: 'Thank you Paystack!',
    });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
});

app.post('/mimonie-bvn-verification/*', function (req, res) {
  // Add your code here
  res.json({ success: 'post call succeed!', url: req.url, body: req.body });
});

/****************************
 * Example put method *
 ****************************/

app.put('/mimonie-bvn-verification', function (req, res) {
  // Add your code here
  res.json({ success: 'put call succeed!', url: req.url, body: req.body });
});

app.put('/mimonie-bvn-verification/*', function (req, res) {
  // Add your code here
  res.json({ success: 'put call succeed!', url: req.url, body: req.body });
});

/****************************
 * Example delete method *
 ****************************/

app.delete('/mimonie-bvn-verification', function (req, res) {
  // Add your code here
  res.json({ success: 'delete call succeed!', url: req.url });
});

app.delete('/mimonie-bvn-verification/*', function (req, res) {
  // Add your code here
  res.json({ success: 'delete call succeed!', url: req.url });
});

app.listen(3000, function () {
  console.log('App started');
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
