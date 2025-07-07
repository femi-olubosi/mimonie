const {
  chargeAndSplitPayment,
  chargeCardForPersonalContribution,
  transferToBank,
} = require('./paystack.js');
const { v4: uuidv4 } = require('uuid');
const { sendNotification } = require('./pushNotification.js');
const {
  saveUserActivity,
  updateContribution,
  updateParticipant,
} = require('../models/models.js');
const { BREAK_POINT, THRESH_HOLD } = require('../utils/constants.js');

const contributions = {
  async processGroupContribution(contribution, participants, currentCount) {
    const inProgressParticipant = participants.find(
      (p) => p.status === 'in progress'
    );
    let allPaymentsSuccessful = true;
    let paymentsProcessed = false;

    for (const participant of participants) {
      if (
        participant.status !== 'in progress' &&
        participant.last_successful_round !== currentCount
      ) {
        const flow = await chargeAndSplitPayment(
          inProgressParticipant.subaccount_code,
          participant,
          contribution.amount
        );

        if (flow?.data?.status === 'success') {
          participant.contributions = (participant.contributions || 0) + 1;
          participant.last_successful_round =
            (participant.last_successful_round || 0) + 1;
          paymentsProcessed = true;

          await saveUserActivity({
            id: uuidv4(),
            userId: participant.userId,
            type: 'contribution',
            amount: contribution.amount,
            extra: JSON.stringify({ contribution_id: contribution.id }) || null,
            description: `Paid ${inProgressParticipant.name} for ${contribution.name}`,
          });

          // Send notification to the debited participant
          await sendNotification(
            participant.push_token,
            'Payment Successful',
            `You successfully paid ${inProgressParticipant.name} for ${contribution.name}`
          );

          await saveUserActivity({
            id: uuidv4(),
            userId: inProgressParticipant.userId,
            type: 'collection',
            amount: contribution.amount,
            extra: JSON.stringify({ contribution_id: contribution.id }) || null,
            description: `Received payment from ${participant.name} for ${contribution.name}`,
          });

          // Send notification to the credited participant
          await sendNotification(
            inProgressParticipant?.push_token,
            'Payment Received',
            `You received payment from ${participant.name} for ${contribution.name}`
          );

          // Update and save the contribution after each successful payment
          // contribution.participant = participants;
          await updateParticipant(participant);
          await updateContribution(contribution);
        } else {
          allPaymentsSuccessful = false;
          await saveUserActivity({
            id: uuidv4(),
            userId: participant.userId,
            type: 'contribution',
            amount: contribution.amount,
            extra: JSON.stringify({ contribution_id: contribution.id }) || null,
            description: `Failed to make payment to ${inProgressParticipant.name} for ${contribution.name}. ${flow?.data?.gateway_response}`,
          });

          // Send notification for failed payment
          await sendNotification(
            participant.push_token,
            'Payment Failed',
            `Your payment to ${inProgressParticipant.name} for ${contribution.name} failed.`
          );
        }
      }
    }

    if (allPaymentsSuccessful && paymentsProcessed) {
      await saveUserActivity({
        id: uuidv4(),
        userId: inProgressParticipant.userId,
        type: 'collection',
        amount: contribution.amount * (participants.length - 1),
        extra: JSON.stringify({ contribution_id: contribution.id }) || null,
        description: `Final collection for ${contribution.name}`,
      });

      const currentIndex = inProgressParticipant.index + 1;
      const nextParticipant = participants.find(
        (p) => p.index === currentIndex
      );

      if (nextParticipant) {
        nextParticipant.status = 'in progress';
      }

      inProgressParticipant.status = 'received';
      inProgressParticipant.last_successful_round =
        (inProgressParticipant.last_successful_round || 0) + 1;

      const allReceived = participants.every(
        (participant) => participant.status === 'received'
      );

      // contribution.participant = participants;
      await updateParticipant(nextParticipant);
      await updateParticipant(inProgressParticipant);
      if (allReceived) {
        const owner = participants.find((p) => p.type === 'owner');
        // pay owner 1% of every contribution
        const numOfTimes = participants.length * (participants.length - 1);
        const ownerAmount = contribution.amount * numOfTimes * 0.01;

        await transferToBank(owner.recipient, ownerAmount, contribution);

        await sendNotification(
          owner.push_token,
          'Payment Processed',
          `Your ownership payment for ${contribution.name} is processed`
        );

        await saveUserActivity({
          id: uuidv4(),
          userId: owner.userId,
          type: 'collection',
          amount: ownerAmount,
          extra: JSON.stringify({ contribution_id: contribution.id }) || null,
          description: `Received owner's fee for ${contribution.name}`,
        });
        contribution.status = 'completed';
      }

      contribution.currently_at = (contribution.currently_at || 0) + 1;

      await updateContribution(contribution);
    }
  },

  async processPersonalContribution(contribution, participants, currentCount) {
    const participant = participants[0];
    if (participant.last_successful_round !== currentCount) {
      const flow = await chargeCardForPersonalContribution(
        participant,
        contribution.amount
      );

      if (flow?.data?.status === 'success') {
        participant.contributions = (participant.contributions || 0) + 1;
        participant.balance = (participant.balance || 0) + contribution.amount;
        participant.last_successful_round =
          (participant.last_successful_round || 0) + 1;

        await saveUserActivity({
          id: uuidv4(),
          userId: participant.userId,
          type: 'Personal Savings',
          amount: contribution.amount,
          extra: JSON.stringify({ contribution_id: contribution.id }) || null,
          description: `Successfully completed this round of ${contribution.name} contribution`,
        });

        // Send notification to the debited participant
        await sendNotification(
          participant.push_token,
          'Payment Successful',
          `Successfully completed this round of ${contribution.name} contribution`
        );

        // Update and save the contribution after each successful payment
        contribution.currently_at = (contribution.currently_at || 0) + 1;
        // contribution.participant = participants;
        await updateParticipant(participant);

        if (contribution.currently_at === contribution.num_of_month) {
          contribution.status = 'completed';
        }

        await updateContribution(contribution);
      } else {
        await saveUserActivity({
          id: uuidv4(),
          userId: participant.userId,
          type: 'Personal Savings',
          amount: contribution.amount,
          extra: JSON.stringify({ contribution_id: contribution.id }) || null,
          description: `Failed to make payment for ${contribution.name}. ${flow?.data?.gateway_response}. Your savings will be closed after 5 consecutive failed charges`,
        });

        // Send notification for failed payment
        await sendNotification(
          participant.push_token,
          'Payment Failed',
          `Your payment for ${contribution.name} failed. Your savings will be closed after ${BREAK_POINT} consecutive failed charges (48 hours)`
        );

        if (
          currentCount - (participant.last_successful_round || 0) >=
          THRESH_HOLD
        ) {
          contribution.status = 'stopped';
          await updateContribution(contribution);

          await saveUserActivity({
            id: uuidv4(),
            userId: participant.userId,
            type: 'Personal Savings',
            amount: contribution.amount,
            extra: JSON.stringify({ contribution_id: contribution.id }) || null,
            description: `Your payment for ${contribution.name} has failed ${BREAK_POINT} times and your savings is now stopped`,
          });

          // Send notification for closed savings
          await sendNotification(
            participant.push_token,
            'Savings Closed',
            `Your payment for ${contribution.name} has failed ${BREAK_POINT} times and your savings is now stopped`
          );
        }
      }
    }
  },
};

module.exports = contributions;
