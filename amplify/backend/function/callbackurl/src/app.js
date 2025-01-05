const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const smileIdentityCore = require('smile-identity-core');
const { v4: uuidv4 } = require('uuid');
const { Expo } = require('expo-server-sdk');
const crypto = require('crypto');
// const multer = require('multer');

// Smile ID Configuration
const partner_id = process.env.PARTNER_ID;
const job_status_api = process.env.JOB_STATUS_API;
const sid_server = '1'; // 0 for Sandbox, 1 for Production
const api_key =
  sid_server === '0' ? process.env.API_KEY : process.env.API_KEY_PROD;
const default_callback =
  sid_server === '0' ? process.env.CALLBACK_URL : process.env.CALLBACK_URL_PROD;

const SIDSignature = smileIdentityCore.Signature;
const SIDWebAPI = smileIdentityCore.WebApi;

const basic_verify_async =
  sid_server === '0'
    ? process.env.BASIC_VERIFY_ASYNC
    : process.env.BASIC_VERIFY_ASYNC_LIVE;
const basic_verify =
  sid_server === '0' ? process.env.BASIC_VERIFY : process.env.BASIC_VERIFY_LIVE;
const signatureInstance = new smileIdentityCore.Signature(partner_id, api_key);

// DynamoDB Configuration
// const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbClient = new DynamoDBClient({ region: 'us-west-2' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Table Names
const profileTableName = process.env.PROFILE_TABLE_NAME;
const userNotificationTableName = process.env.NOTIFICATIONS_TABLE_NAME;

// const storage = multer.memoryStorage(); // Store files in memory for easy base64 conversion
// const upload = multer({ storage });

// Initialize Express App
const app = express();
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Initialize Expo Notifications
const expo = new Expo();

// Helper: Send Push Notification
const sendNotification = async (pushToken, title, body) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Invalid push token: ${pushToken}`);
    return;
  }

  const message = { to: pushToken, sound: 'default', title, body };

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    console.log('Notification sent:', ticketChunk);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Helper: Save Notification to DynamoDB
const saveUserNotification = async (userId, title, content) => {
  const timestamp = new Date().toISOString();
  const notification = {
    id: uuidv4(),
    userId,
    title,
    content,
    type: 'verification',
    read: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const params = {
    TableName: userNotificationTableName,
    Item: notification,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    console.log('Notification saved:', notification);
  } catch (error) {
    console.error('Error saving notification:', error.message);
  }
};

// Helper: Update User Profile
const updateUserProfile = async (userId, isVerified, inProgress) => {
  const params = {
    TableName: profileTableName,
    Key: { id: userId },
    UpdateExpression:
      'SET is_nin_verified = :isVerified, verification_in_progress_id = :inProgress',
    ExpressionAttributeValues: {
      ':isVerified': isVerified,
      ':inProgress': inProgress,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const result = await ddbDocClient.send(new UpdateCommand(params));
    console.log('User profile updated:', result);
    return result;
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    throw new Error('Failed to update user profile');
  }
};

const successRes = [
  '1020',
  '1021',
  '1012',
  '0810',
  '0812',
  '0815',
  '0817',
  '1210',
  '0820',
  '0822',
  '0825',
  '1220',
  '0840',
  '1240',
];

app.post('/biometric-verification', async (req, res) => {
  try {
    const { id_type, user_id, selfie_image, doc_image } = req.body;

    // Create job parameters
    const job_id = `job-${uuidv4()}`;
    const partner_params = { job_id, user_id, job_type: 6 };

    const id_info = {
      country: 'NG',
      id_type,
    };

    const image_details = [
      { image_type_id: 2, image: selfie_image }, // Selfie image
      { image_type_id: 3, image: doc_image }, // Document front image
    ];

    const options = {
      return_job_status: true,
      return_history: false,
      return_image_links: false,
      signature: true,
    };

    const connection = new SIDWebAPI(
      partner_id,
      default_callback,
      api_key,
      sid_server
    );

    // Submit job to Smile ID
    const response = await connection.submit_job(
      partner_params,
      image_details,
      id_info,
      options
    );

    if (successRes.includes(response?.result?.ResultCode)) {
      return res.status(200).json({
        success: true,
        result: 'approved',
        message: 'Verification Successful',
        job_id,
      });
    }

    return res.status(200).json({
      success: true,
      result: 'rejected',
      message: 'Verification Rejected',
      job_id,
    });
  } catch (error) {
    console.error('Error submitting verification job:', error.message);
    res.status(500).json({
      success: false,
      result: 'error',
      message: 'Internal server error',
      error: error,
    });
  }
});

app.post('/biometric-verification/biometric', async (req, res) => {
  try {
    const {
      id_type,
      id_number,
      first_name,
      last_name,
      dob,
      user_id,
      selfie_image,
    } = req.body;

    // Create job parameters
    const job_id = `job-${uuidv4()}`;
    const partner_params = { job_id, user_id, job_type: 1 };

    const id_info = {
      first_name,
      last_name,
      country: 'NG',
      id_type,
      id_number,
      dob,
      entered: 'true',
    };

    const image_details = [
      { image_type_id: 2, image: selfie_image }, // Selfie image
    ];

    const options = {
      return_job_status: true,
      return_history: false,
      return_image_links: false,
      signature: true,
    };

    const connection = new SIDWebAPI(
      partner_id,
      default_callback,
      api_key,
      sid_server
    );

    // Submit job to Smile ID
    const response = await connection.submit_job(
      partner_params,
      image_details,
      id_info,
      options
    );

    if (successRes.includes(response.ResultCode)) {
      return res.status(200).json({
        success: true,
        result: 'approved',
        message: 'Verification successful',
        response,
        job_id,
      });
    }

    return res.status(400).json({
      success: false,
      result: 'rejected',
      message: 'Verification failed',
      response,
      job_id,
    });
  } catch (error) {
    console.error('Error submitting verification job:', error.message);
    res.status(500).json({
      success: false,
      result: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
});

app.post('/biometric-verification/test', async (req, res) => {
  try {
    const { user_id, id_type, push_token, selfie_image, doc_image } = req.body;

    const image_details = [
      { image_type_id: 2, image: selfie_image }, // Selfie image
      { image_type_id: 3, image: doc_image }, // Document front image
    ];

    // Send response
    res.status(200).json({
      success: true,
      message: 'Verification job submitted successfully',
      image_details,
    });
  } catch (error) {
    console.error('Error in test endpoint:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Callback Endpoint
app.post('/smileid-callback', async (req, res) => {
  try {
    const {
      PartnerParams,
      ResultCode,
      ResultText,
      signature,
      timestamp,
      IDNumber,
      FullName,
      DOB,
      Actions,
    } = req.body;

    const userId = PartnerParams.user_id;

    // Confirm the signature for security
    // if (!signatureInstance.confirm_signature(timestamp, signature)) {
    //   console.error('Invalid callback signature');
    //   return res
    //     .status(400)
    //     .json({ success: false, message: 'Invalid signature' });
    // }

    const isVerified = successRes.includes(ResultCode);

    // Update user profile based on the result
    await updateUserProfile(userId, isVerified, false);

    const title = isVerified
      ? 'Verification Successful'
      : 'Verification Failed';
    const content = isVerified
      ? `Your document (ID: ${IDNumber}) has been successfully verified.`
      : 'Your document verification failed. Please try again.';

    // Save notification and send push notification
    await saveUserNotification(userId, title, content);
    if (req.body.push_token) {
      await sendNotification(req.body.push_token, title, content);
    }

    res.status(200).json({
      success: true,
      message: 'Callback processed successfully',
      result: {
        FullName,
        DOB,
        IDNumber,
        Actions,
        ResultCode,
        ResultText,
      },
    });
  } catch (error) {
    console.error('Error processing callback:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing callback',
      error: error.message,
    });
  }
});

const generateSignature = () => {
  const timestamp = new Date().toISOString();
  const hmac = crypto.createHmac('sha256', api_key);

  hmac.update(timestamp, 'utf8');
  hmac.update(partner_id, 'utf8');
  hmac.update('sid_request', 'utf8');

  const signature = hmac.digest('base64');
  return { timestamp, signature };
};

app.post('/biometric-verification/status', async (req, res) => {
  const { jobId, userId } = req.body;

  if (!jobId || !userId) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing jobId or userId' });
  }

  const { timestamp, signature } = generateSignature();

  const payload = {
    timestamp,
    signature,
    partner_id,
    job_id: jobId,
    user_id: userId,
    image_links: false,
    history: false,
  };

  try {
    // Make request to Smile ID API
    const response = await fetch(job_status_api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (successRes.includes(result.result.ResultCode)) {
      return res.status(200).json({
        success: true,
        result: 'approved',
        message: 'Verification successful',
      });
    }

    return res.status(400).json({
      success: false,
      result: 'rejected',
      message: 'Verification failed',
    });
  } catch (error) {
    console.error('Error fetching job status:', error.message);
    res.status(500).json({
      success: false,
      result: 'rejected',
      message: 'Internal server error',
      error: error.message,
    });
  }
});

app.post('/biometric-verification/basic', async (req, res) => {
  const {
    id_type,
    id_number,
    first_name,
    last_name,
    dob,
    phone_number,
    user_id,
    bank_code,
  } = req.body;

  if (
    !id_type ||
    !id_number ||
    !first_name ||
    !last_name ||
    !user_id ||
    !phone_number ||
    !dob
  ) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing required fields' });
  }

  const { timestamp, signature } = generateSignature();

  const job_id = `job-${uuidv4()}`;

  const payload = {
    source_sdk: 'rest_api',
    source_sdk_version: '1.0.0',
    partner_id,
    signature,
    timestamp,
    country: 'NG',
    id_type,
    id_number,
    first_name,
    last_name,
    dob,
    phone_number,
    bank_code,
    callback_url: default_callback,
    partner_params: {
      job_id,
      user_id,
    },
  };

  try {
    const response = await fetch(basic_verify, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (successRes.includes(result.ResultCode)) {
      return res.status(200).json({
        success: true,
        result: 'approved',
        message: 'Verification successful',
        job_id,
      });
    }

    return res.status(200).json({
      success: false,
      result: 'rejected',
      message: 'Verification failed',
      smile_response: result,
    });
  } catch (error) {
    console.error('Error submitting KYC request:', error.message);
    res.status(500).json({
      success: false,
      result: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
});

app.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString(),
  });
});

// Start Express Server
app.listen(3000, () => {
  console.log('App started on port 3000');
});

module.exports = app;
