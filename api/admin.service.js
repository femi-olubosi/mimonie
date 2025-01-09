import { UserProfile } from '@/src/models';
import { DataStore } from 'aws-amplify/datastore';

export const fetchAllUsers = async (setAllUsers) => {
  try {
    // await DataStore.clear();
    await DataStore.start();
    // Fetch contributions where the user is a participant
    const userProfile = await DataStore.query(UserProfile);
    setAllUsers(userProfile);
    return userProfile;
  } catch (error) {
    console.error('Error fetching user user profile:', error);
    return [];
  }
};
