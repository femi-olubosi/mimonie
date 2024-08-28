import { DataStore } from 'aws-amplify/datastore';
import { UserActivity } from '../src/models';

export const fetchUserActivities = async (userId, setUserActivities) => {
  try {
    await DataStore.start();

    const activities = await DataStore.query(UserActivity, (c) =>
      c.userId.eq(userId)
    );
    const sorted = activities.sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : 1
    );

    setUserActivities(sorted);

    return sorted;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }
};
