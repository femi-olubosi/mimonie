import { DataStore } from 'aws-amplify/datastore';
import { Contribution } from '../src/models';

export const fetchUserContributions = async (userId, setContributions) => {
  try {
    await DataStore.start();
    // Fetch contributions where the user is a participant
    const userContributions = await DataStore.query(Contribution, (c) =>
      c.participant_ids.contains(userId)
    );

    const sorted = userContributions.sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : 1
    );

    setContributions(sorted);

    // Set up real-time subscription
    const subscription = DataStore.observe(Contribution).subscribe(
      async (msg) => {
        if (
          msg.opType === 'INSERT' ||
          msg.opType === 'UPDATE' ||
          msg.opType === 'DELETE'
        ) {
          const updatedContributions = await DataStore.query(
            Contribution,
            (c) => c.participant_ids.contains(userId)
          );
          const sortedUpdated = updatedContributions.sort((a, b) =>
            a.createdAt > b.createdAt ? -1 : 1
          );
          setContributions(sortedUpdated);
        }
      }
    );

    return () => subscription.unsubscribe();
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return [];
  }
};

export const createContribution = async (
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
    email: currentUser.email,
    status: 'in progress',
  };
  try {
    const newContribution = await DataStore.save(
      new Contribution({
        name: details.contributionName,
        title: details.contributionName,
        category: details.groupName,
        // start_date: details.date,
        invite_link: `https://app.mimonie.com/${
          currentUser.userId
        }-${details.contributionName.split(' ').join('-')}`,
        contributiongroupsID: details.groupId,
        participant: [userObj],
        participant_ids: [currentUser.userId],
        owner: userProfile.name,
        target: details.target,
        amount: details.amount,
        num_of_month: details.num_of_month,
        status: 'open',
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
    const subscription = DataStore.observe(Contribution, id).subscribe(
      async (msg) => {
        if (msg.opType === 'UPDATE') {
          const updatedContributions = await DataStore.query(
            Contribution,
            (c) => c.id.eq(id)
          );

          setContribution(updatedContributions[0]);
        }
      }
    );

    // Return a cleanup function to unsubscribe
    return () => subscription.unsubscribe();
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return [];
  }
};
