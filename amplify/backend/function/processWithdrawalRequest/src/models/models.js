const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = new DynamoDBClient({ region: 'us-west-2' });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDB);

const contributionTableName = 'Contribution-d4itlx42uzhtrctybtkmaxruya-dev';
const userActivityTableName = 'UserActivity-d4itlx42uzhtrctybtkmaxruya-dev';
const withdrawalRequestTableName = 'withdrawalRequests-dev';
const contributionParticipantTableName =
  'ContributionParticipant-d4itlx42uzhtrctybtkmaxruya-dev';

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
      const result = await ddbDocClient.send(new GetCommand(params));
      return result.Item;
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

  async updateRequestStatus(requestId, created_at, status, processing_status) {
    const updatedAt = new Date().toISOString();

    const params = {
      TableName: withdrawalRequestTableName,
      Key: { id: requestId, created_at },
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

  async getContributionParticipants(contributionId) {
    const params = {
      TableName: contributionParticipantTableName,
      FilterExpression: 'contributionID = :contributionId',
      ExpressionAttributeValues: {
        ':contributionId': contributionId,
      },
    };

    try {
      const data = await ddbDocClient.send(new ScanCommand(params));
      return data.Items || [];
    } catch (err) {
      console.error('Error fetching contribution participants:', err);
      throw new Error('Could not fetch contribution participants');
    }
  },

  async updateParticipant(participant) {
    const params = {
      TableName: contributionParticipantTableName,
      Item: participant,
    };

    try {
      return await ddbDocClient.send(new PutCommand(params));
    } catch (err) {
      console.error('Error updating participant:', err);
      throw new Error('Could not update participant');
    }
  },
};

module.exports = models;
