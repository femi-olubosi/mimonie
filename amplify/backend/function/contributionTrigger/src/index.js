const { Expo } = require('expo-server-sdk');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

let expo = new Expo();

const dynamoDB = new DynamoDBClient({ region: 'us-west-2' });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDB);

const contributionTableName = 'Contribution-d4itlx42uzhtrctybtkmaxruya-dev';
const userActivityTableName = 'UserActivity-d4itlx42uzhtrctybtkmaxruya-dev';
const PAYSTACK_SECRET_KEY_LIVE = process.env.PAYSTACK_SECRET_KEY_LIVE;

const https = require('https');

const makePaystackRequest = async (endpoint, method, data) => {
  const url = `https://api.paystack.co${endpoint}`;
  const headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY_LIVE}`,
    'Content-Type': 'application/json',
  };

  const options = {
    method,
    headers,
    hostname: 'api.paystack.co',
    path: endpoint,
    port: 443,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (!res.statusCode || res.statusCode >= 400) {
            throw new Error(result.message || 'Something went wrong');
          }
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (method === 'POST' || method === 'PUT') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const calculateDifference = (startDate, variant) => {
  const start = new Date(startDate);
  const now = new Date();
  let difference;

  if (variant === 'days') {
    difference = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  } else if (variant === 'weeks') {
    const startDayOfWeek = start.getDay();

    const targetDayOfWeek = 1;
    const daysUntilFirstTargetDay = (targetDayOfWeek - startDayOfWeek + 7) % 7;
    const firstTargetDay = new Date(start);
    firstTargetDay.setDate(start.getDate() + daysUntilFirstTargetDay);

    if (now < firstTargetDay) {
      difference = 0;
    } else {
      difference =
        Math.floor((now - firstTargetDay) / (1000 * 60 * 60 * 24 * 7)) + 1;
    }
  } else if (variant === 'months') {
    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const daysInCurrentMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();

    if (now.getDate() >= 28 || now.getDate() === daysInCurrentMonth) {
      difference = (currentYear - startYear) * 12 + currentMonth - startMonth;
    } else {
      difference = 0;
    }
  } else {
    difference = 0;
  }

  return difference;
};

// Function to send a push notification
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
// Function to fetch contributions
const fetchRunningContributions = async () => {
  const params = {
    TableName: contributionTableName,
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'running',
    },
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    return data.Items;
  } catch (err) {
    console.error('Error fetching contributions:', err);
    throw new Error('Could not fetch contributions');
  }
};

// Function to save user activity
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

// Function to update contributions
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

// Function to charge and split payment
const chargeAndSplitPayment = async (subaccount_code, payer, amount) => {
  // Calculate the transaction charge (3.5% of the base contribution amount)
  const transactionCharge = Math.round(amount * 0.045); // 4.5% of the contribution amount

  // Adjust the amount to include the transaction charge
  const adjustedAmount = amount + transactionCharge;

  const data = {
    email: payer.email,
    amount: `${adjustedAmount * 100}`,
    authorization_code: payer.auth_url,
    subaccount: subaccount_code,
    transaction_charge: `${transactionCharge * 100}`,
    bearer: 'account',
    metadata: JSON.stringify({
      custom_fields: [
        {
          display_name: 'Purpose',
          variable_name: 'purpose',
          value: 'Contribution',
        },
      ],
    }),
  };
  return await makePaystackRequest(
    '/transaction/charge_authorization',
    'POST',
    data
  );
};

const chargeCardForPersonalContribution = async (payer, amount) => {
  // Calculate the transaction charge (3.5% of the base contribution amount)
  const transactionCharge = Math.round(amount * 0.035); // 3.5% of the contribution amount

  // Adjust the amount to include the transaction charge
  const adjustedAmount = amount + transactionCharge;

  const data = {
    email: payer.email,
    amount: `${adjustedAmount * 100}`,
    authorization_code: payer.auth_url,
    bearer: 'account',
    metadata: JSON.stringify({
      custom_fields: [
        {
          display_name: 'Purpose',
          variable_name: 'purpose',
          value: 'Contribution',
        },
      ],
    }),
  };
  return await makePaystackRequest(
    '/transaction/charge_authorization',
    'POST',
    data
  );
};

const transferToBank = async (recipient_code, amount, contribution) => {
  const data = {
    recipient: recipient_code,
    amount: amount * 100,
    source: 'balance',
    reason: `owner's fee for ${contribution.name}`,
  };

  return await makePaystackRequest('/transfer', 'POST', data);
};

// Main processing function
const processContributions = async () => {
  try {
    const contributions = await fetchRunningContributions();

    for (const contribution of contributions) {
      // Calculate the difference based on the variant
      const currentCount = calculateDifference(
        contribution.start_date,
        contribution.variant
      );

      // Stop updating current_count if it equals num_of_month - 1
      if (contribution.current_count !== contribution.num_of_month) {
        contribution.current_count = currentCount;
      }

      await updateContribution(contribution);

      // Convert currently_at to an integer if it is not already
      const currentAt = parseInt(contribution.currently_at) || 0;

      // Skip if currently_at matches currentCount or if currentCount is 0 (same day as start date)
      if (currentAt === currentCount || currentCount === 0) continue;

      const participants = contribution?.participant;
      if (contribution.type === 'group') {
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

              await saveUserActivity({
                id: uuidv4(),
                userId: participant.userId,
                type: 'contribution',
                amount: contribution.amount,
                description: `Paid ${inProgressParticipant.name} for ${contribution.name}`,
              });

              // Send notification to the debited participant
              await sendNotification(
                participant?.push_token,
                'Payment Successful',
                `You successfully paid ${inProgressParticipant.name} for ${contribution.name}`
              );

              await saveUserActivity({
                id: uuidv4(),
                userId: inProgressParticipant.userId,
                type: 'collection',
                amount: contribution.amount,
                description: `Received payment from ${participant.name} for ${contribution.name}`,
              });

              // Send notification to the credited participant
              await sendNotification(
                inProgressParticipant?.push_token,
                'Payment Received',
                `You received payment from ${participant.name} for ${contribution.name}`
              );

              // Update and save the contribution after each successful payment
              contribution.participant = participants;
              await updateContribution(contribution);
            } else {
              await saveUserActivity({
                id: uuidv4(),
                userId: participant.userId,
                type: 'contribution',
                amount: contribution.amount,
                description: `Failed to make payment to ${inProgressParticipant.name} for ${contribution.name}. ${flow?.data?.gateway_response}`,
              });

              // Send notification for failed payment
              await sendNotification(
                participant?.push_token,
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

          for (const participant of participants[0]) {
            participant.last_successful_round = currentCount;
          }

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

          contribution.participant = participants;
          if (allReceived) {
            const owner = participants[0].find((p) => p.type === 'owner');
            const numOfTimes =
              participants[0].length * (participants[0].length - 1);
            const ownerAmount = contribution.amount * numOfTimes * 0.01;
            await transferToBank(
              owner?.recipient_code,
              ownerAmount,
              contribution
            );

            await sendNotification(
              owner?.push_token,
              'Payment Processed',
              `Your ownership payment for ${contribution.name} is processed`
            );

            await saveUserActivity({
              id: uuidv4(),
              userId: owner.userId,
              type: 'collection',
              amount: ownerAmount,
              description: `Received owner's fee for ${contribution.name}`,
            });
            contribution.status = 'completed';
          }

          contribution.currently_at = currentCount;

          await updateContribution(contribution);
        }
      } else {
        const participant = participants[0][0];
        if (participant.last_successful_round !== currentCount) {
          const flow = await chargeCardForPersonalContribution(
            participant,
            contribution.amount
          );

          if (flow.data.status === 'success') {
            participant.contributions = (participant.contributions || 0) + 1;
            participant.balance =
              (participant.balance || 0) + contribution.amount;
            participant.last_successful_round = currentCount;

            await saveUserActivity({
              id: uuidv4(),
              userId: participant.userId,
              type: 'Personal Savings',
              amount: contribution.amount,
              description: `Successfully completed this round of ${contribution.name} contribution`,
            });

            // Send notification to the debited participant
            await sendNotification(
              participant?.push_token,
              'Payment Successful',
              `Successfully completed this round of ${contribution.name} contribution`
            );

            // Update and save the contribution after each successful payment
            contribution.currently_at = currentCount;
            contribution.participant = participants;
            await updateContribution(contribution);

            if (contribution.currently_at === contribution.num_of_month) {
              contribution.status = 'completed';
              await updateContribution(contribution);
            }
          } else {
            await saveUserActivity({
              id: uuidv4(),
              userId: participant.userId,
              type: 'Personal Savings',
              amount: contribution.amount,
              description: `Failed to make payment for ${contribution.name}. ${flow?.data?.gateway_response}`,
            });

            // Send notification for failed payment
            await sendNotification(
              participant?.push_token,
              'Payment Failed',
              `Your payment for ${contribution.name} failed.`
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing contributions:', error);
  }
};

exports.handler = async (event, context) => {
  await processContributions();
};
