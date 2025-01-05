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

export const createUserActivity = async (userId, activityData) => {
  try {
    const newActivity = new UserActivity({
      userId: userId,
      type: activityData.type,
      amount: activityData.amount,
      description: activityData.description,
    });

    await DataStore.save(newActivity);
    return newActivity;
  } catch (error) {
    return null;
  }
};
