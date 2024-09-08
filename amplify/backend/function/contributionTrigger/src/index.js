const { Expo } = require('expo-server-sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Expo push notification setup
let expo = new Expo();

// Create a new DynamoDB client
const dynamoDB = new DynamoDBClient({ region: 'us-west-2' });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDB);

// DynamoDB table names
const contributionTableName = 'Contribution-d4itlx42uzhtrctybtkmaxruya-dev';
const userActivityTableName = 'UserActivity-d4itlx42uzhtrctybtkmaxruya-dev';

// Function to send push notifications
const sendNotification = async (pushToken, title, body, data = {}) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    console.log('Notification sent:', ticketChunk);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Helper functions to interact with DynamoDB
const fetchRunningContributions = async () => {
  const params = {
    TableName: contributionTableName,
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': 'running' },
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    return data.Items;
  } catch (err) {
    console.error('Error fetching contributions:', err);
    throw new Error('Could not fetch contributions');
  }
};

const saveUserActivity = async (activity) => {
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
};

const updateContribution = async (contribution) => {
  const params = {
    TableName: contributionTableName,
    Item: contribution,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
  } catch (err) {
    console.error('Error updating contribution:', err);
    throw new Error('Could not update contribution');
  }
};

// Main contribution processing logic
const processContributions = async () => {
  try {
    const contributions = await fetchRunningContributions();

    for (const contribution of contributions) {
      const currentCount = calculateDifference(
        contribution.start_date,
        contribution.variant
      );

      if (contribution.current_count !== contribution.num_of_month) {
        contribution.current_count = currentCount;
      }

      await updateContribution(contribution);

      const currentAt = parseInt(contribution.currently_at) || 0;
      if (currentAt === currentCount || currentCount === 0) continue;

      const participants = contribution?.participant;
      const inProgressParticipant = participants[0].find(
        (p) => p.status === 'in progress'
      );

      let allPaymentsSuccessful = true;
      let paymentsProcessed = false;

      for (const participant of participants[0]) {
        if (
          participant.status !== 'in progress' &&
          participant.last_successful_round !== currentCount
        ) {
          const flow = await chargeAndSplitPayment(
            inProgressParticipant.subaccount_code,
            participant,
            contribution.amount
          );

          if (flow.data.status === 'success') {
            participant.contributions = (participant.contributions || 0) + 1;
            participant.last_successful_round = currentCount;
            paymentsProcessed = true;

            // Save successful payment activity
            await saveUserActivity({
              id: uuidv4(),
              userId: participant.userId,
              type: 'contribution',
              amount: contribution.amount,
              description: `Paid ${inProgressParticipant.name} for ${contribution.name}`,
            });

            // Send notification to the debited participant
            await sendNotification(
              participant?.pushToken,
              'Payment Successful',
              `You successfully paid ${inProgressParticipant.name} for ${contribution.name}`
            );

            // Save collection activity for the receiver
            await saveUserActivity({
              id: uuidv4(),
              userId: inProgressParticipant.userId,
              type: 'collection',
              amount: contribution.amount,
              description: `Received payment from ${participant.name} for ${contribution.name}`,
            });

            // Send notification to the credited participant
            await sendNotification(
              inProgressParticipant?.pushToken,
              'Payment Received',
              `You received payment from ${participant.name} for ${contribution.name}`
            );

            // Update and save contribution
            contribution.participant = participants;
            await updateContribution(contribution);
          } else {
            // Save failed payment activity
            await saveUserActivity({
              id: uuidv4(),
              userId: participant.userId,
              type: 'contribution',
              amount: contribution.amount,
              description: `Failed to make payment to ${inProgressParticipant.name} for ${contribution.name}. ${flow?.data?.gateway_response}`,
            });

            // Send notification for failed payment
            await sendNotification(
              participant?.pushToken,
              'Payment Failed',
              `Your payment to ${inProgressParticipant.name} for ${contribution.name} failed.`
            );

            allPaymentsSuccessful = false;
          }
        }
      }

      if (allPaymentsSuccessful && paymentsProcessed) {
        await saveUserActivity({
          id: uuidv4(),
          userId: inProgressParticipant.userId,
          type: 'collection',
          amount: contribution.amount * (participants[0].length - 1),
          description: `Final collection for ${contribution.name}`,
        });

        inProgressParticipant.status = 'received';

        const nextParticipant = participants[0].find(
          (p) => p.status === 'pending'
        );
        if (nextParticipant) {
          nextParticipant.status = 'in progress';
        }

        const allReceived = participants[0].every(
          (participant) => participant.status === 'received'
        );
        if (allReceived) {
          contribution.status = 'completed';
        }

        contribution.currently_at = currentCount;
        contribution.participant = participants;

        await updateContribution(contribution);
      }
    }
  } catch (error) {
    console.error('Error processing contributions:', error);
  }
};

exports.handler = async (event, context) => {
  await processContributions();
};
