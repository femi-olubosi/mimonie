import { DataStore } from 'aws-amplify/datastore';
import { ContributionGroups } from '../src/models';

export const getContributionGroups = async (setContributionGroups) => {
  try {
    // Fetch initial data
    const groups = await DataStore.query(ContributionGroups);
    setContributionGroups(groups);
    // Set up real-time subscription
    const subscription = DataStore.observe(ContributionGroups).subscribe(
      (msg) => {
        // Fetch the updated data
        DataStore.query(ContributionGroups).then((updatedGroups) => {
          setContributionGroups(updatedGroups);
        });
      }
    );

    // Clean up the subscription when the component unmounts
    return () => subscription.unsubscribe();
  } catch (error) {
    console.log('Error retrieving posts', error);
  }
};
