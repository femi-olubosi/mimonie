/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { getCurrentUser } = require('aws-amplify/auth');

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = 'dynamoc73ffc4d';
if (process.env.ENV && process.env.ENV !== 'NONE') {
  tableName = tableName + '-' + process.env.ENV;
}

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

/**********************
 * Example get method *
 **********************/

app.get('/user-info', async function (req, res) {
  var params = {
    TableName: tableName,
    Select: 'ALL_ATTRIBUTES',
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items);
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: 'Could not load items: ' + err.message });
  }
});

// app.get('/user-info/*', function (req, res) {
//   // Add your code here
//   res.json({ success: 'get call succeed!', url: req.url });
// });

/****************************
 * Example post method *
 ****************************/

app.post('/user-info', async function (req, res) {
  // Add your code here
  // const user = await getCurrentUser();

  try {
    const IDP_REGEX = /.*\/.*,(.*)\/(.*):CognitoSignIn:(.*)/;
    const authProvider =
      req.apiGateway.event.requestContext.identity
        .cognitoAuthenticationProvider;
    const [, , , userId] = authProvider.match(IDP_REGEX);

    const cognito = new AWS.CognitoIdentityServiceProvider();
    const listUsersResponse = await cognito
      .listUsers({
        UserPoolId: process.env.AUTH_LAMBDAUSERSOMENUMBER_USERPOOLID,
        Filter: `sub = "${userId}"`,
        Limit: 1,
      })
      .promise();
    const user = listUsersResponse.Users[0];
    res.json({ user, message: 'get call succeed!', url: req.url });
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err, url: req.url, body: req.body });
  }
});

app.post('/user-info/*', function (req, res) {
  // Add your code here
  res.json({ success: 'post call succeed!', url: req.url, body: req.body });
});

/****************************
 * Example put method *
 ****************************/

app.put('/user-info', function (req, res) {
  // Add your code here
  res.json({ success: 'put call succeed!', url: req.url, body: req.body });
});

app.put('/user-info/*', function (req, res) {
  // Add your code here
  res.json({ success: 'put call succeed!', url: req.url, body: req.body });
});

/****************************
 * Example delete method *
 ****************************/

app.delete('/user-info', function (req, res) {
  // Add your code here
  res.json({ success: 'delete call succeed!', url: req.url });
});

app.delete('/user-info/*', function (req, res) {
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
