const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = new DynamoDBClient({ region: 'us-west-2' });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDB);

const contributionTableName = 'Contribution-d4itlx42uzhtrctybtkmaxruya-dev';
const userActivityTableName = 'UserActivity-d4itlx42uzhtrctybtkmaxruya-dev';

const models = {
      // Function to save user activity
      async saveUserActivity(activity){
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

      // Function to update contributions
      async updateContribution(contribution){
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
      }
}

module.exports = models;