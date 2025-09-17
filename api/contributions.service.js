import { DataStore, SortDirection } from 'aws-amplify/datastore';
import { Contribution, ContributionParticipant } from '../src/models';
import { triggerNotificationForUser } from './pushNotification.service';
import { createUserActivity } from './activities.service';
import { createTransferRecipientForBank } from './payment.service';
import { get } from 'aws-amplify/api';

export const fetchUserContributions = async (
  userId,
  setContributions,
  limit = 10
) => {
  if (!userId) {
    return [];
  }

  try {
    const userContributions = await DataStore.query(
      Contribution,
      (c) => c.participant_ids.contains(userId),
      {
        limit: limit,
        sort: (c) => c.createdAt(SortDirection.DESCENDING),
      }
    );

    setContributions(userContributions || []);

    return userContributions || [];
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    throw error;
  }
};

export const fetchUserInvitedContributions = async (
  userId,
  setInviteArray,
  limit = 10
) => {
  if (!userId) {
    return [];
  }

  try {
    const userInviteContributions = await DataStore.query(Contribution, (c) =>
      c.and((c) => [
        c.participant_ids.notContains(userId),
        c.access.contains(userId),
      ])
    );
    setInviteArray(userInviteContributions || []);
    return userInviteContributions || [];
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    throw error;
  }
};

export const createContribution = async (
  details,
  setContributions,
  currentUser,
  userProfile
) => {
  const link = `https://mimonie.net/(protected)/mimonie?userId=${
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
        participant: [],
        participant_ids: [currentUser.userId],
        access: [currentUser.userId],
        picture: currentUser.picture,
        owner: userProfile.name,
        owner_id: userProfile.userId,
        target: details.target,
        amount: details.amount,
        num_of_month: details.num_of_month,
        status: 'open',
        current_count: 0,
        variant: details.variant,
        type: 'group',
      })
    );

    await addContributionParticipant(
      newContribution.id,
      userProfile,
      0,
      currentUser?.picture,
      userProfile?.userId
    );

    setContributions((prev) => [...prev, newContribution]);

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
  const link = `https://mimonie.net/(protected)/mimonie?userId=${
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
        participant: [],
        participant_ids: [currentUser.userId],
        picture: currentUser.picture,
        owner: userProfile.name,
        owner_id: userProfile.userId,
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
    await addContributionParticipant(
      newContribution.id,
      userProfile,
      0,
      currentUser?.picture,
      userProfile.userId
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

export const editContributionParticipant = async (
  contributionId,
  participants
) => {
  try {
    const updatedParticipants = [];

    for (const participant of participants) {
      const original = await DataStore.query(ContributionParticipant, (c) =>
        c.and((c) => [
          c.contributionID.eq(contributionId),
          c.userId.eq(participant.userId),
        ])
      );

      const updated = await DataStore.save(
        ContributionParticipant.copyOf(original[0], (updated) => {
          updated.index = participant.index;
          updated.status = participant.index === 1 ? 'in progress' : 'pending';
        })
      );

      updatedParticipants.push(updated);
    }

    return updatedParticipants;
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
  try {
    const contributions = await DataStore.query(Contribution, id);

    setContribution(contributions);

    // Set up real-time subscription

    return contributions;
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return [];
  }
};

export const fetchAllUserContributions = async () => {
  try {
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
    extra: contribution.id,
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
    extra: contribution.id,
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
      extra: contribution.id,
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

export const updatePersonalContribution = async (
  contribution,
  userProfile,
  start_date
) => {
  const originalContribution = await DataStore.query(
    Contribution,
    contribution.id
  );

  if (!originalContribution) {
    throw new Error('Contribution not found');
  }

  // const participants = JSON.parse(originalContribution.participant);
  const participants = await DataStore.query(ContributionParticipant, (c) =>
    c.and((c) => [
      c.contributionID.eq(contribution.id),
      c.userId.eq(userProfile.userId),
    ])
  );
  const participant = participants[0];

  if (participant.userId !== userProfile.userId) {
    throw new Error('User is not part of this contribution');
  }

  const contributions = (participant.contributions || 0) + 1;
  const last_successful_round = (participant.last_successful_round || 0) + 1;
  const balance = (participant.balance || 0) + originalContribution.amount;

  await triggerNotificationForUser(
    userProfile?.push_token,
    'Payment Successful',
    `You successfully saved to ${contribution.name}`
  );

  await createUserActivity(userProfile.userId, {
    type: 'Personal savings',
    amount: contribution.amount,
    description: `You successfully saved to ${contribution.name}`,
    extra: contribution.id,
  });

  await DataStore.save(
    Contribution.copyOf(originalContribution, (updated) => {
      updated.participant = participants;
      updated.currently_at = (updated.currently_at ?? 0) + 1;
      updated.status = 'running';
      updated.current_count = (updated.current_count ?? 0) + 1;
      updated.start_date = start_date;
    })
  );

  await DataStore.save(
    ContributionParticipant.copyOf(participants[0], (updated) => {
      updated.contributions = contributions;
      updated.last_successful_round = last_successful_round;
      updated.balance = balance;
    })
  );
};

export const addContributionParticipant = async (
  contributionID,
  newParticipant,
  existingParticipant,
  picture,
  owner_id
) => {
  let recipient_code = null;

  if (newParticipant.recipient_code) {
    recipient_code = newParticipant.recipient_code;
  } else {
    recipient_code = await createTransferRecipientForBank({
      bank_code: newParticipant.bank_details.bank_code,
      account_number: newParticipant.bank_details.account_number,
      account_name: newParticipant.name,
    });
  }

  const index = (existingParticipant ?? 0) + 1;
  const status = existingParticipant > 0 ? 'pending' : 'in progress';
  const type = existingParticipant > 0 ? 'participant' : 'owner';

  try {
    const participantData = {
      contributionID,
      userId: newParticipant.userId,
      name: newParticipant.name,
      email: newParticipant.email,
      contribution_owner_id: owner_id,
      status,
      index,
      subaccount_code: newParticipant.subaccount_code,
      auth_url: newParticipant.auth_url,
      last_successful_round: 0,
      picture: picture,
      contributions: 0,
      push_token: newParticipant.push_token,
      recipient: recipient_code || null,
      type,
    };

    const newParticipantData = await DataStore.save(
      new ContributionParticipant(participantData)
    );

    return newParticipantData;
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
};

export const updateContributionParticipantList = async (
  contributionID,
  userId
) => {
  const originalContribution = await DataStore.query(
    Contribution,
    contributionID
  );

  await DataStore.save(
    Contribution.copyOf(originalContribution, (updated) => {
      updated.participant_ids.push(userId);
    })
  );
};

export const fetchParticipants = async (contributionId, owner_id, userId) => {
  console.log(owner_id === userId);
  try {
    if (owner_id === userId) {
      // Owner uses local sync (DataStore)
      const participants = await DataStore.query(ContributionParticipant, (c) =>
        c.contributionID.eq(contributionId)
      );
      return participants || [];
    } else {
      // Others fetch via REST API (listParticipants)
      const restOperation = get({
        apiName: 'userInfo',
        path: `/contributions/${contributionId}`,
      });

      const response = await restOperation.response;
      const participants = await response.body.json();

      return participants.data || [];
    }
  } catch (error) {
    console.log('GET call failed: ', JSON.parse(error.response.body));
    return [];
  }
};

// export const listParticipants = async (contributionId) => {
//   try {
//     const restOperation = get({
//       apiName: 'userInfo',
//       path: `/contributions/${contributionId}`,
//     });

//     const response = await restOperation.response;
//     const participants = await response.body.json();

//     return participants.data;
//   } catch (error) {
//     console.error('Error fetching participants:', error);
//     throw error;
//   }
// };

export const fetchMeParticipants = async (contributionId, userId) => {
  try {
    const participants = await DataStore.query(ContributionParticipant, (c) =>
      c.and((c) => [c.contributionID.eq(contributionId), c.userId.eq(userId)])
    );

    return participants || [];
  } catch (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
};
