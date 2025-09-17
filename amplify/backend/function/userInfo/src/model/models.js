const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  GetCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ddbClient = new DynamoDBClient({ region: 'us-west-2' });
const ses = new SESClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const withdrawalRequestTableName = 'withdrawalRequests-dev';
const userProfileTableName = 'UserProfile-d4itlx42uzhtrctybtkmaxruya-dev';
const contributionParticipantTableName =
  'ContributionParticipant-d4itlx42uzhtrctybtkmaxruya-dev';

const models = {
  async createWithdrawalRequest(data) {
    const createdAt = new Date().toISOString();
    const requestId = `${data.contributionId}-${Date.now()}`;

    const params = {
      TableName: withdrawalRequestTableName,
      Item: {
        id: requestId,
        userId: data.userId,
        contribution_id: data.contributionId,
        amount: data.amount,
        is_early_withdrawal: data.isEarlyWithdrawal,
        recipient_code: data.recipientCode,
        status: 'pending',
        processing_status: 'ready',
        created_at: createdAt,
        updated_at: createdAt,
      },
    };

    try {
      await ddbDocClient.send(new PutCommand(params));
      return params.Item;
    } catch (err) {
      throw err;
    }
  },

  async getActiveRequestByContribution(contributionId) {
    const params = {
      TableName: withdrawalRequestTableName,
      IndexName: 'contributionIndex',
      KeyConditionExpression:
        'contribution_id = :cid AND begins_with(#status, :statusPrefix)',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':cid': contributionId,
        ':statusPrefix': 'pending',
      },
      Limit: 1,
    };

    try {
      const result = await ddbDocClient.send(new QueryCommand(params));
      return result.Items || null;
    } catch (err) {
      console.error('Error getting active request:', err);
      throw err;
    }
  },

  async cancelWithdrawalRequest(requestId) {
    const updatedAt = new Date().toISOString();

    const params = {
      TableName: withdrawalRequestTableName,
      Key: { id: requestId },
      UpdateExpression:
        'SET #status = :status, processing_status = :procStatus, updated_at = :updatedAt',
      ConditionExpression: '#status = :pending',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'canceled',
        ':procStatus': 'canceled',
        ':updatedAt': updatedAt,
        ':pending': 'pending',
      },
      ReturnValues: 'ALL_NEW',
    };

    try {
      const result = await ddbDocClient.send(new UpdateCommand(params));
      return result.Attributes;
    } catch (err) {
      if (err.name === 'ConditionalCheckFailedException') {
        throw new Error(
          'Request cannot be canceled (already processing or completed)'
        );
      }
      console.error('Error canceling request:', err);
      throw err;
    }
  },

  async createUserProfile(profileData) {
    const timestamp = new Date().toISOString();
    const params = {
      TableName: userProfileTableName,
      Item: {
        id: uuidv4(),
        ...profileData,
        _lastChangedAt: new Date().getTime(),
        _version: 1,
        __typename: 'UserProfile',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    try {
      await ddbDocClient.send(
        new PutCommand({
          params,
        })
      );
      return item;
    } catch (err) {
      console.error('Error creating user profile:', err);
      throw err;
    }
  },

  async getUserProfile(userId) {
    const params = {
      TableName: userProfileTableName,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: {
        ':uid': userId,
      },
      Limit: 1,
    };

    try {
      const result = await ddbDocClient.send(new QueryCommand(params));
      return result.Items?.[0] || null;
    } catch (err) {
      console.error('Error getting user profile by userId:', err);
      throw err;
    }
  },

  async listUserProfiles(limit = 50) {
    try {
      const result = await ddbDocClient.send(
        new ScanCommand({
          TableName: userProfileTableName,
          Limit: limit,
        })
      );
      return result.Items || [];
    } catch (err) {
      console.error('Error listing user profiles:', err);
      throw err;
    }
  },

  async updateUserProfile(id, updates) {
    const now = new Date().toISOString();
    const lastChangedAt = new Date().getTime();
    const updateExp = [];
    const names = {};
    const values = { ':updated_at': now, ':_lastChangedAt': lastChangedAt };

    for (const [key, value] of Object.entries(updates)) {
      const placeholder = `#${key}`;
      const valuePlaceholder = `:${key}`;
      updateExp.push(`${placeholder} = ${valuePlaceholder}`);
      names[placeholder] = key;
      values[valuePlaceholder] = value;
    }

    updateExp.push('updated_at = :updated_at');

    const params = {
      TableName: userProfileTableName,
      Key: { id: id },
      UpdateExpression: `SET ${updateExp.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW',
    };

    try {
      const result = await ddbDocClient.send(new UpdateCommand(params));
      return result.Attributes;
    } catch (err) {
      console.error('Error updating user profile:', err);
      throw err;
    }
  },

  async getUserProfileByPhoneNumber(phoneNumber) {
    const params = {
      TableName: userProfileTableName,
      IndexName: 'phone_number-index',
      KeyConditionExpression: 'phone_number = :phone',
      ExpressionAttributeValues: {
        ':phone': phoneNumber,
      },
      Limit: 1,
    };

    try {
      const result = await ddbDocClient.send(new QueryCommand(params));
      return result.Items?.[0] || null;
    } catch (err) {
      console.error('Error getting user profile by phone number:', err);
      throw err;
    }
  },

  async listContributionParticipantsByContributionId(contribution_id) {
    const params = {
      TableName: contributionParticipantTableName,
      IndexName: 'byContribution',
      KeyConditionExpression: 'contributionID = :cid',
      ExpressionAttributeValues: {
        ':cid': contribution_id,
      },
    };

    try {
      const result = await ddbDocClient.send(new QueryCommand(params));
      return result.Items || [];
    } catch (err) {
      console.error('Error getting user profile by phone number:', err);
      throw err;
    }
  },

  async deleteUserProfile(data) {
    const { id, email } = data;
    const params = {
      TableName: userProfileTableName,
      Key: { id },
    };

    const emailParams = {
      Destination: { ToAddresses: [email] },
      Message: {
        Body: {
          Text: {
            Data: `Hello, your account (${email}) has been successfully deleted from our platform.`,
          },
        },
        Subject: { Data: 'Account Deletion Confirmation' },
      },
      Source: 'support@mimonie.net',
    };

    try {
      await ddbDocClient.send(new DeleteCommand(params));

      if (email) {
        await ses.send(new SendEmailCommand(emailParams));
      }

      return {
        success: true,
        message: `User profile with id ${userId} deleted.`,
      };
    } catch (err) {
      console.error('Error deleting user profile:', err);
      return {
        success: false,
        message: 'Failed to delete user profile.',
        error: err,
      };
    }
  },
};

module.exports = models;
