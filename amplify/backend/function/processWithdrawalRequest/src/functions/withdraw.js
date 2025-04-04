const { sendNotification } = require('./pushNotification.js');
const {
  saveUserActivity,
  updateContribution,
  updateRequestStatus,
} = require('../models/models.js');
const { transferToBank } = require('./paystack.js');
const { v4: uuidv4 } = require('uuid');

const singleWithdraw = {
  async processSingleWithdrawal(
    requestId,
    contribution,
    participants,
    userId,
    amount,
    isEarlyWithdrawal,
    recipientCode,
    created_at
  ) {
    // Check if the participant exists

    const participant = participants[0]?.find((p) => p?.userId === userId);

    if (!participant) {
      throw new Error('User is not part of this contribution');
    }

    // Ensure participant balance exists and is a valid number
    const participantBalance = Number(participant?.balance || 0);
    // const amount = Number(amount);

    let penalty = 0;
    let withdrawalAmount = Number(amount);

    // Apply penalty if early withdrawal
    if (isEarlyWithdrawal) {
      penalty = withdrawalAmount * 0.1; // 10% penalty on withdrawal amount
      withdrawalAmount = withdrawalAmount - penalty;
    }

    if (withdrawalAmount > participantBalance) {
      throw new Error('Insufficient balance');
    }

    // Execute bank transfer
    const transferResponse = await transferToBank(
      recipientCode,
      withdrawalAmount,
      contribution
    );

    if (transferResponse?.data?.status !== 'pending') {
      await updateRequestStatus(requestId, 'error', 'processed');
      await saveUserActivity({
        id: uuidv4(),
        userId: participant.userId,
        type: 'collection',
        amount: amount,
        extra: JSON.stringify({ contribution_id: contribution.id }) || null,
        description: `Error processing withdrawal from ${contribution.name} savings. Please try again`,
      });

      // Send push notification to the participant
      await sendNotification(
        participant?.push_token,
        `Withdrawal Processed for ${contribution?.name}`,
        `You withdrawal of ${amount} from ${contribution?.name} was not successful. Please try again`
      );
      return {
        success: false,
        message: flow?.data?.gateway_response || 'Transfer failed',
      };
    }

    if (isEarlyWithdrawal) {
      participant.balance = 0;
    } else {
      participant.balance = participantBalance - withdrawalAmount;
    }

    if (participant.balance === 0) {
      contribution.status = 'closed'
    }

    await saveUserActivity({
      id: uuidv4(),
      userId: participant.userId,
      type: 'collection',
      amount: amount,
      extra: JSON.stringify({ contribution_id: contribution.id }) || null,
      description: `Fund withdrawal from ${contribution.name} savings`,
    });

    // Send push notification to the participant
    await sendNotification(
      participant?.push_token,
      `Withdrawal Processed for ${contribution?.name}`,
      `You successfully withdrew ${amount} from ${contribution?.name}`
    );

    // If early withdrawal, record penalty
    if (isEarlyWithdrawal) {
      await saveUserActivity({
        id: uuidv4(),
        userId: participant.userId,
        type: 'Personal Savings',
        amount: penalty,
        extra: JSON.stringify({ contribution_id: contribution.id }) || null,
        description: `Penalty of 10% applied for early withdrawal from ${contribution?.name}`,
      });

      // Send push notification to the participant
      await sendNotification(
        participant?.push_token,
        'Penalty Applied',
        `A 10% penalty was applied for early withdrawal from ${contribution?.name}`
      );
    }

    // Use versioning to prevent concurrent overwrites
    contribution.participant = participants;

    await updateContribution(contribution);
    await updateRequestStatus(requestId, created_at, 'completed', 'processed');
  },
};

module.exports = singleWithdraw;