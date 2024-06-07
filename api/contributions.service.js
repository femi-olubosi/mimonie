import { DataStore } from 'aws-amplify/datastore';
import { Contribution } from '../src/models';

export const fetchUserContributions = async (userId, setContributions) => {
  try {
    // await DataStore.clear();
    // await DataStore.start();
    // Fetch contributions where the user is a participant
    const userContributions = await DataStore.query(Contribution, (c) =>
      c.participant.contains(userId)
    );

    setContributions(userContributions);
    return userContributions;
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return [];
  }
};

export const createContribution = async (details, setContributions) => {
  try {
    const newContribution = await DataStore.save(
      new Contribution({
        name: details.contributionName,
        title: details.contributionName,
        category: details.groupName,
        start_date: details.date,
        invite_link: 'https://www.example.com',
        contributiongroupsID: details.groupId,
        participant: [details.userId],
        owner: details.username,
        target: details.target,
        amount: details.amount,
        num_of_month: details.num_of_month,
        status: 'open',
      })
    );
    console.log('Contribution group created successfully:', newContribution);
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
