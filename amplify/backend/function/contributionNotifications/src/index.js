/* Amplify Params - DO NOT EDIT
    ENV
    REGION
Amplify Params - DO NOT EDIT */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new DynamoDBClient({ region: process.env.REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDB);

const contributionTableName = `Contribution-d4itlx42uzhtrctybtkmaxruya-dev`;
const userNotificationTableName = `UserNotifications-d4itlx42uzhtrctybtkmaxruya-dev`;

// Function to fetch running contributions
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
    console.error('Error fetching running contributions:', err);
    throw new Error('Could not fetch running contributions');
  }
};

// Function to save user notification
const saveUserNotification = async (notification) => {
  const timestamp = new Date().toISOString();
  const params = {
    TableName: userNotificationTableName,
    Item: {
      ...notification,
      _lastChangedAt: new Date().getTime(),
      _version: 1,
      __typename: 'UserNotifications',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
  } catch (err) {
    console.error('Error saving user notification:', err);
    throw new Error('Could not save user notification');
  }
};

// Main notification processing function
const processNotifications = async () => {
  try {
    const contributions = await fetchRunningContributions();
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const dayOfMonth = today.getDate();

    for (const contribution of contributions) {
      const participants = contribution?.participant;

      for (const participant of participants[0]) {
        if (
          participant.status === 'in progress' ||
          contribution.current_count <= participant.contributions
        )
          continue;

        const userId = participant.userId;
        const notificationDetails = {
          id: uuidv4(),
          userId,
          type: 'reminder',
          title: `Reminder: ${contribution.name}`,
          read: false,
          content: '',
        };

        switch (contribution.variant) {
          case 'weeks':
            // Notify every Sunday
            if (dayOfWeek === 0) {
              notificationDetails.content = `Reminder: Weekly contribution due soon for ${contribution.name}`;
              await saveUserNotification(notificationDetails);
            }
            break;
          case 'months':
            // Notify every 27th of the month
            if (dayOfMonth === 27) {
              notificationDetails.content = `Reminder: Monthly contribution due soon for ${contribution.name}`;
              await saveUserNotification(notificationDetails);
            }
            break;
          case 'days':
            // Skip daily notifications
            continue;
          default:
            break;
        }
      }
    }
  } catch (error) {
    console.error('Error processing notifications:', error);
  }
};

exports.handler = async (event, context) => {
  await processNotifications();
};
