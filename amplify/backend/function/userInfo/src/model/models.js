const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    UpdateCommand,
    QueryCommand
} = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({ region: 'us-west-2' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const withdrawalRequestTableName = "withdrawalRequests-dev";

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
                updated_at: createdAt
            }
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
            IndexName: "contributionIndex",
            KeyConditionExpression: "contribution_id = :cid AND begins_with(#status, :statusPrefix)",
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":cid": contributionId,
                ":statusPrefix": "pending"
            },
            Limit: 1
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
            UpdateExpression: 'SET #status = :status, processing_status = :procStatus, updated_at = :updatedAt',
            ConditionExpression: '#status = :pending',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'canceled',
                ':procStatus': 'canceled',
                ':updatedAt': updatedAt,
                ':pending': 'pending'
            },
            ReturnValues: 'ALL_NEW'
        };

        try {
            const result = await ddbDocClient.send(new UpdateCommand(params));
            return result.Attributes;
        } catch (err) {
            if (err.name === 'ConditionalCheckFailedException') {
                throw new Error('Request cannot be canceled (already processing or completed)');
            }
            console.error('Error canceling request:', err);
            throw err;
        }
    },
};

module.exports = models;