import { DataStore } from 'aws-amplify/datastore';
import { UserActivity } from '../src/models';

export const fetchUserActivities = async (userId, setUserActivities) => {
  try {
    await DataStore.start();
    // Fetch contributions where the user is a participant
    const activities = await DataStore.query(UserActivity, (c) =>
      c.userId.eq(userId)
    );

    const sorted = activities.sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : 1
    );

    setUserActivities(sorted);
    return activities;
  } catch (error) {
    console.error('Error fetching user user activities:', error);
    return [];
  }
};
