const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand
} = require('@aws-sdk/lib-dynamodb');

const dynamoDB = new DynamoDBClient({ region: 'us-west-2' });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDB);

const notificationTableName = 'UserNotifications-d4itlx42uzhtrctybtkmaxruya-dev';


const notificationModel = {
    async listNotifications(lastEvaluatedKey = null, limit = 20) {
        const params = {
            TableName: notificationTableName,
            IndexName: "CreatedAtIndex", // GSI name
            KeyConditionExpression: "#typename = :type",
            ExpressionAttributeNames: {
                "#typename": "__typename" //
            },
            ExpressionAttributeValues: {
                ":type": "UserNotifications"
            },
            ScanIndexForward: false, // False = Descending order
            Limit: limit,
        };

        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
          }
    
        const result = await ddbDocClient.send(new QueryCommand(params));
 
        return {
            items: result.Items,
            nextToken: result.LastEvaluatedKey
        };
    }
}

module.exports = notificationModel