import { DataStore } from 'aws-amplify/datastore';
import { Contribution } from '../src/models';
import { triggerNotificationForUser } from './pushNotification.service';
import { createUserActivity } from './activities.service';
import { createTransferRecipientForBank } from './payment.service';

export const fetchUserContributions = async (userId, setContributions) => {
  try {
    await DataStore.start();

    const userContributions = await DataStore.query(Contribution, (c) =>
      c.participant_ids.contains(userId)
    );

    const sorted = userContributions.sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : 1
    );

    setContributions(sorted);

    return sorted;
  } catch (error) {
    console.error('Error fetching user contributions:', error);
  }
};

export const createContribution = async (
  details,
  setContributions,
  currentUser,
  userProfile
) => {
  const recipient_code = userProfile.recipient_code
    ? userProfile.recipient_code
    : await createTransferRecipientForBank({
        bank_code: userProfile.bank_details.bank_code,
        account_number: userProfile.bank_details.account_number,
        account_name: userProfile.name,
      });

  const userObj = {
    name: userProfile.name || currentUser.preferred_username,
    picture: currentUser.picture,
    index: 1,
    userId: currentUser.userId,
    contributions: 0,
    auth_url: userProfile.auth_url,
    subaccount_code: userProfile.subaccount_code,
    email: currentUser.email,
    last_successful_round: 0,
    push_token: userProfile.push_token,
    recipient: recipient_code,
    status: 'in progress',
    type: 'owner',
  };

  const link = `https://mimonie.net/protected/mimonie?userId=${
    currentUser.userId
  }&contributionName=${details.contributionName.split(' ').join('')}`;

  try {
    const newContribution = await DataStore.save(
      new Contribution({
        name: details.contributionName,
        title: details.contributionName,
        category: details.groupName,
        invite_link: link,
        contributiongroupsID: details.groupId,
        participant: [userObj],
        participant_ids: [currentUser.userId],
        owner: userProfile.name,
        target: details.target,
        amount: details.amount,
        num_of_month: details.num_of_month,
        status: 'open',
        current_count: 0,
        variant: details.variant,
        type: 'group',
      })
    );
    setContributions((prev) => [...prev, newContribution]);
    console.log(newContribution);
    return newContribution;
  } catch (error) {
    console.error('Error creating contribution group:', error);
    throw error;
  }
};

export const createPersonalContribution = async (
  details,
  setContributions,
  currentUser,
  userProfile
) => {
  const userObj = {
    name: userProfile.name || currentUser.preferred_username,
    picture: currentUser.picture,
    index: 1,
    userId: currentUser.userId,
    contributions: 0,
    auth_url: userProfile.auth_url,
    subaccount_code: userProfile.subaccount_code,
    recipient_code: userProfile.recipient_code,
    email: currentUser.email,
    last_successful_round: 0,
    push_token: userProfile.push_token,
    status: 'active',
  };

  const link = `https://mimonie.net/protected/mimonie?userId=${
    currentUser.userId
  }&contributionName=${details.contributionName.split(' ').join('')}`;

  try {
    const newContribution = await DataStore.save(
      new Contribution({
        name: details.contributionName,
        title: details.contributionName,
        category: details.groupName,
        invite_link: link,
        contributiongroupsID: details.groupId,
        participant: [userObj],
        participant_ids: [currentUser.userId],
        owner: userProfile.name,
        target: details.target,
        amount: details.amount,
        num_of_month: details.num_of_month,
        status: 'open',
        current_count: 0,
        variant: details.variant,
        start_date: details.start_date,
        type: 'personal',
      })
    );
    setContributions((prev) => [...prev, newContribution]);
    return newContribution;
  } catch (error) {
    console.error('Error creating contribution group:', error);
    throw error;
  }
};

export const deleteContribution = async (contributionId) => {
  try {
    // Query for the contribution to be deleted
    const toDelete = await DataStore.query(Contribution, contributionId);

    // Check if the contribution exists
    if (toDelete) {
      // Delete the contribution

      await DataStore.delete(toDelete);
      console.log(
        `Contribution with ID ${contributionId} deleted successfully.`
      );
    } else {
      console.log(`Contribution with ID ${contributionId} not found.`);
    }
  } catch (error) {
    console.error(
      `Error deleting contribution with ID ${contributionId}:`,
      error
    );
  }
};

export async function updateContribution(id, updates) {
  const original = await DataStore.query(Contribution, id);

  const updatedContribution = await DataStore.save(
    Contribution.copyOf(original, (updated) => {
      Object.keys(updates).forEach((key) => {
        updated[key] = updates[key];
      });
    })
  );

  return updatedContribution;
}

export const joinContribution = async (
  contributionId,
  currentUser,
  userProfile,
  setContributions
) => {
  try {
    // Fetch the existing contribution
    const originalContribution = await DataStore.query(
      Contribution,
      contributionId
    );

    if (!originalContribution) {
      throw new Error('Contribution not found');
    }

    // Parse the participant JSON array
    const participants = JSON.parse(originalContribution.participant);
    // Check if the user is already a participant
    if (
      participants.some(
        (participant) => participant.userId === currentUser.userId
      )
    ) {
      throw new Error('User is already a participant in this contribution');
    }

    // Create a new participant object
    const newParticipant = {
      name: userProfile.name || currentUser.preferred_username,
      picture: currentUser.picture,
      index: participants.length + 1,
      userId: currentUser.userId,
      contributions: 0,
      email: currentUser.email,
      auth_url: userProfile.auth_url,
      subaccount_code: userProfile.subaccount_code,
      last_successful_round: 0,
      push_token: userProfile.push_token,
      status: 'pending',
    };

    // Add the new participant to the participants array
    participants.push(newParticipant);

    // Update the contribution with the new participant
    const updatedContribution = await DataStore.save(
      Contribution.copyOf(originalContribution, (updated) => {
        updated.participant = participants;
        updated.participant_ids.push(currentUser.userId);
      })
    );

    // Update the state with the new contribution
    setContributions((prev) =>
      prev.map((contribution) =>
        contribution.id === contributionId ? updatedContribution : contribution
      )
    );

    return updatedContribution;
  } catch (error) {
    console.error('Error joining contribution:', error);
    throw error;
  }
};

export const findContributionByInviteLink = async (invite_link) => {
  try {
    const contributions = await DataStore.query(Contribution, (c) =>
      c.invite_link.eq(invite_link)
    );
    return contributions;
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return [];
  }
};

export const findContributionByID = async (id, setContribution) => {
  await DataStore.start();
  try {
    const contributions = await DataStore.query(Contribution, (c) =>
      c.id.eq(id)
    );
    setContribution(contributions[0]);

    // Set up real-time subscription

    return contributions[0];
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return [];
  }
};

export const fetchAllUserContributions = async () => {
  try {
    await DataStore.start();

    const userContributions = await DataStore.query(Contribution);

    const sorted = userContributions.sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : 1
    );

    return sorted;
  } catch (error) {
    console.error('Error fetching user contributions:', error);
  }
};

export const updateContributionForUser = async (contribution, userProfile) => {
  const originalContribution = await DataStore.query(
    Contribution,
    contribution.id
  );

  if (!originalContribution) {
    throw new Error('Contribution not found');
  }

  const participants = JSON.parse(originalContribution.participant);

  const inProgressParticipant = participants.find(
    (participant) => participant.status === 'in progress'
  );
  const updatedParticipants = participants.map((participant) =>
    participant.userId === userProfile.userId
      ? {
          ...participant,
          contributions: (participant.contributions || 0) + 1,
          last_successful_round: originalContribution.current_count,
        }
      : participant
  );

  await triggerNotificationForUser(
    userProfile?.push_token,
    'Payment Successfull',
    `You successfully paid ${inProgressParticipant.name} for ${contribution.name}`
  );

  await createUserActivity(userProfile.userId, {
    type: 'contribution',
    amount: contribution.amount,
    description: `Paid ${inProgressParticipant.name} for ${contribution.name}`,
  });

  await triggerNotificationForUser(
    inProgressParticipant?.push_token,
    'Payment Received',
    `You received payment from ${userProfile.name} for ${contribution.name}`
  );

  await createUserActivity(inProgressParticipant.userId, {
    type: 'collection',
    amount: contribution.amount,
    description: `Received payment from ${userProfile.name} for ${contribution.name}`,
  });

  await DataStore.save(
    Contribution.copyOf(originalContribution, (updated) => {
      updated.participant = updatedParticipants;
    })
  );

  const allPaid = updatedParticipants.every(
    (participant) =>
      participant.userId === inProgressParticipant.userId ||
      participant.last_successful_round === originalContribution.current_count
  );

  if (allPaid) {
    await createUserActivity(inProgressParticipant.userId, {
      type: 'collection',
      amount: contribution.amount * participants.length,
      description: `Final collection for ${contribution.name}`,
    });

    updatedParticipants.forEach((participant) => {
      if (participant.userId === inProgressParticipant.userId) {
        participant.status = 'received';
        participant.contributions = (participant.contributions || 0) + 1;
        participant.last_successful_round = originalContribution.current_count;
      }
    });

    const nextParticipantIndex = updatedParticipants.findIndex(
      (p) => p.status === 'pending'
    );

    if (nextParticipantIndex !== -1) {
      updatedParticipants[nextParticipantIndex].status = 'in progress';
    }

    const allReceived = updatedParticipants.every(
      (participant) => participant.status === 'received'
    );

    await DataStore.save(
      Contribution.copyOf(originalContribution, (updated) => {
        updated.participant = updatedParticipants;
        updated.currently_at = originalContribution.current_count;
        if (allReceived) {
          updated.status = 'completed';
        }
      })
    );
  }
};

export const updatePersonalContribution = async (contribution, userProfile) => {
  const originalContribution = await DataStore.query(
    Contribution,
    contribution.id
  );

  if (!originalContribution) {
    throw new Error('Contribution not found');
  }

  const participants = JSON.parse(originalContribution.participant);
  const participant = participants[0];

  if (participant.userId !== userProfile.userId) {
    throw new Error('User is not part of this contribution');
  }

  participant.contributions = (participant.contributions || 0) + 1;
  participant.last_successful_round = originalContribution.current_count;
  participant.balance =
    (participant.balance || 0) + originalContribution.amount;

  await triggerNotificationForUser(
    userProfile?.push_token,
    'Payment Successful',
    `You successfully contributed to ${contribution.name}`
  );

  await createUserActivity(userProfile.userId, {
    type: 'contribution',
    amount: contribution.amount,
    description: `You successfully contributed to ${contribution.name}`,
  });

  await DataStore.save(
    Contribution.copyOf(originalContribution, (updated) => {
      updated.participant = participants;
      updated.currently_at = originalContribution.current_count;
      if (participant.contributions >= originalContribution.num_of_month) {
        updated.status = 'completed';
      }
    })
  );
};
