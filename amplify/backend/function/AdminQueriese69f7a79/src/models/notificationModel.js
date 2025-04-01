const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    QueryCommand
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

let expo = new Expo();

const dynamoDB = new DynamoDBClient({ region: 'us-west-2' });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDB);

const notificationTableName = 'UserNotifications-d4itlx42uzhtrctybtkmaxruya-dev';


const notificationModel = {
    async listNotifications(lastEvaluatedKey = null, limit = null) {
        const params = {
            TableName: notificationTableName,
            IndexName: "CreatedAtIndex", // GSI name
            KeyConditionExpression: "constant_key = :key",
            ExpressionAttributeValues: {
                ":key": "ALL_ITEMS"
            },
            ScanIndexForward: false, // False = Descending order
            Limit: limit,
        };

        if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
        }

        //   if (searchTerm) {
        //     params.FilterExpression =
        //       'contains(product_name, :searchTerm) OR contains(product_barcode, :searchTerm)';
        //     params.ExpressionAttributeValues[':searchTerm'] = searchTerm;
        //   }

        const result = await ddbDocClient.send(new QueryCommand);

        return {
            items: result.Items,
            lastEvaluatedKey: result.LastEvaluatedKey
        };
    }
}

module.exports = notificationModel