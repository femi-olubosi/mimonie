import { DataStore } from 'aws-amplify/datastore';
import { ContributionGroups } from '../src/models';

export const getContributionGroups = async (setContributionGroups) => {
  try {
    const groups = await DataStore.query(ContributionGroups);
    setContributionGroups(groups);
  } catch (error) {
    console.log('Error retrieving posts', error);
  }
};
