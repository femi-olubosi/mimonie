const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = new DynamoDBClient({ region: 'us-west-2' });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDB);

const contributionTableName = 'Contribution-d4itlx42uzhtrctybtkmaxruya-dev';
const userActivityTableName = 'UserActivity-d4itlx42uzhtrctybtkmaxruya-dev';
const withdrawalRequestTableName = 'withdrawalRequests-dev';

const models = {
  // Function to save user activity
  async saveUserActivity(activity) {
    const timestamp = new Date().toISOString();
    const params = {
      TableName: userActivityTableName,
      Item: {
        ...activity,
        _lastChangedAt: new Date().getTime(),
        _version: 1,
        __typename: 'UserActivity',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    try {
      await ddbDocClient.send(new PutCommand(params));
    } catch (err) {
      console.error('Error saving user activity:', err);
      throw new Error('Could not save user activity');
    }
  },

  async getContribution(contributionId) {
    const params = {
      TableName: contributionTableName,
      Key: { id: contributionId },
    };

    try {
      return await ddbDocClient.send(new GetCommand(params));
    } catch (err) {
      console.error('Error getting contribution:', err);
      throw new Error('Could not get contribution');
    }
  },

  // Function to update contributions
  async updateContribution(contribution) {
    const params = {
      TableName: contributionTableName,
      Item: contribution,
    };

    try {
      return await ddbDocClient.send(new PutCommand(params));
    } catch (err) {
      console.error('Error updating contribution:', err);
      throw new Error('Could not update contribution');
    }
  },

  async updateRequestStatus(requestId, status, processing_status) {
    const updatedAt = new Date().toISOString();

    const params = {
      TableName: withdrawalRequestTableName,
      Key: { id: requestId },
      UpdateExpression:
        'SET #status = :status, processing_status = :processing_status, updated_at = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':processing_status': processing_status,
        ':updatedAt': updatedAt,
      },
      ReturnValues: 'ALL_NEW',
    };

    try {
      const result = await ddbDocClient.send(new UpdateCommand(params));
      return result.Attributes;
    } catch (err) {
      console.error('Error updating request:', err);
      throw err;
    }
  },
};

module.exports = models;
