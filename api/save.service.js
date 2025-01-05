const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  await processContributions();
};

const processContributions = async () => {
  try {
    const params = {
      TableName: 'Contributions',
      FilterExpression: 'status = :status',
      ExpressionAttributeValues: { ':status': 'in progress' },
    };

    const contributions = await docClient.scan(params).promise();

    for (const contribution of contributions.Items) {
      const participants = contribution.participants;
      const inProgressParticipant = participants.find(
        (p) => p.status === 'in progress'
      );

      if (!inProgressParticipant) {
        console.error(
          `No participant with status 'in progress' found for contribution ${contribution.contributionId}`
        );
        continue;
      }

      let allPaymentsSuccessful = true;

      for (const participant of participants) {
        if (participant.status !== 'in progress') {
          const flow = await chargeAndSplitPayment(
            inProgressParticipant.subaccount_code,
            participant,
            contribution.amount
          );

          if (flow) {
            participant.contributions.push({
              type: 'debit',
              amount: contribution.amount,
              status: 'success',
            });

            await logUserActivity(
              participant.id,
              'contribution',
              contribution.amount,
              `Paid ${inProgressParticipant.name} for ${contribution.name}`
            );
            await logUserActivity(
              inProgressParticipant.id,
              'collection',
              contribution.amount,
              `Received payment from ${participant.name} for ${contribution.name}`
            );
          } else {
            console.error(
              `Failed to deduct amount from participant ${participant.id}`
            );
            allPaymentsSuccessful = false;
          }
        }
      }

      if (allPaymentsSuccessful) {
        inProgressParticipant.contributions.push({
          type: 'credit',
          amount: contribution.amount * (participants.length - 1),
          status: 'success',
        });

        await logUserActivity(
          inProgressParticipant.id,
          'collection',
          contribution.amount * (participants.length - 1),
          `Final collection for ${contribution.name}`
        );

        inProgressParticipant.status = 'received';

        const nextParticipant = participants.find(
          (p) => p.status === 'pending'
        );
        if (nextParticipant) {
          nextParticipant.status = 'in progress';
        }

        participants.forEach((participant) => {
          if (
            participant.status !== 'received' &&
            participant.status !== 'in progress'
          ) {
            participant.status = 'pending';
          }
        });

        const updateParams = {
          TableName: 'Contributions',
          Key: { contributionId: contribution.contributionId },
          UpdateExpression: 'set participants = :participants',
          ExpressionAttributeValues: { ':participants': participants },
        };

        await docClient.update(updateParams).promise();
      }
    }
  } catch (error) {
    console.error('Error processing contributions:', error);
  }
};

const chargeAndSplitPayment = async (subaccount_code, payer, amount) => {
  const data = {
    email: payer.email,
    amount: (amount * 100).toString(),
    authorization_code: payer.authorization_code,
    subaccount: subaccount_code,
    bearer: 'subaccount',
  };

  return await makePaystackRequest(
    '/transaction/charge_authorization',
    'POST',
    data
  );
};

const logUserActivity = async (userId, type, amount, description) => {
  const params = {
    TableName: 'UserActivities',
    Item: {
      activityId: AWS.util.uuid.v4(),
      userId,
      type,
      amount,
      description,
    },
  };

  await docClient.put(params).promise();
};
