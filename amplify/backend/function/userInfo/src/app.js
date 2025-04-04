/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const models = require('./model/models');


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


app.post('/request-withdrawal', async (req, res) => {
  const data = req.body;
  try {
    const request = await models.createWithdrawalRequest(data);
    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    // const statusCode = error.message.includes('already exists') ? 409 : 500;
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/request-withdrawal/:contributionId', async (req, res) => {
  const { contributionId } = req.params;

  try {
    const request = await models.getActiveRequestByContribution(contributionId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'No active request found'
      });
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/request-withdrawal/:requestId', async (req, res) => {
  const { requestId } = req.params;

  try {
    const canceledRequest = await models.cancelWithdrawalRequest(requestId);
    res.json({ success: true, data: canceledRequest });
  } catch (error) {
    const statusCode = error.message.includes('cannot be canceled') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});


app.listen(3000, function () {
  console.log('App started');
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
