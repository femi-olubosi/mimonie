/* Amplify Params - DO NOT EDIT
    ENV
    REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const { getContribution } = require('./models/models.js');
const { processSingleWithdrawal } = require('./functions/withdraw.js');
const models = require('./models/models.js');

const withdrawFunds = async (request) => {
  const {
    id,
    created_at,
    userId,
    contribution_id,
    amount,
    is_early_withdrawal,
    recipient_code,
  } = request;
  try {
    const contribution = await getContribution(contribution_id);

    if (!contribution) {
      throw new Error('Contribution not found');
    }

    // const participants = contribution?.participant;
    const participants = await models.getContributionParticipants(
      contribution.id
    );

    const transfer = await processSingleWithdrawal(
      id,
      contribution,
      participants,
      userId,
      amount,
      is_early_withdrawal,
      recipient_code,
      created_at
    );

    console.log('Transfer successful:', transfer);
  } catch (error) {
    console.log('Transfer failed:', error);
  }
};

exports.handler = async (event) => {
  for (const record of event.Records) {
    const request = JSON.parse(record.body);
    console.log('Processing contribution:', request);
    try {
      await withdrawFunds(request);
    } catch (error) {
      console.error('Failed processing contribution:', error);
    }
  }
};
