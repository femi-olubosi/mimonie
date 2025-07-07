const {
  processGroupContribution,
  processPersonalContribution,
} = require('./functions/contributions.js');
const models = require('./models/models.js');
const { updateContribution } = require('./models/models.js');
const { calculateDifference } = require('./utils/helper.js');

// Main processing function
const processContribution = async (contribution) => {
  try {
    const currentCount = calculateDifference(
      contribution.start_date,
      contribution.variant
    );
    if (contribution.current_count !== contribution.num_of_month) {
      contribution.current_count = currentCount;
      await updateContribution(contribution);
    }

    // Convert currently_at to an integer if it is not already
    const currentAt = parseInt(contribution.currently_at) || 0;

    // Skip if currently_at matches currentCount or if currentCount is 0 (same day as start date)
    if (currentAt >= currentCount || currentCount === 0) return;

    // const participants = contribution?.participant;
    const participants = await models.getContributionParticipants(
      contribution.id
    );

    if (contribution.type === 'group') {
      await processGroupContribution(contribution, participants, currentCount);
    } else {
      await processPersonalContribution(
        contribution,
        participants,
        currentCount
      );
    }
  } catch (error) {
    console.error(`Error processing contribution ${contribution.id}:`, error);
  }
};

exports.handler = async (event, context) => {
  for (const record of event.Records) {
    const contribution = JSON.parse(record.body);

    try {
      await processContribution(contribution);
    } catch (error) {
      console.error('Failed processing contribution:', error);
    }
  }
};
