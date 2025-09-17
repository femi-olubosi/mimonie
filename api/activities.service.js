import { DataStore, SortDirection } from 'aws-amplify/datastore';
import { Contribution, UserActivity } from '../src/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchUserActivities = async (
  userId,
  setUserActivities,
  limit = 10
) => {
  try {
    const freshActivities = await DataStore.query(
      UserActivity,
      (c) => c.userId.eq(userId),
      {
        limit: limit,
        sort: (c) => c.createdAt(SortDirection.DESCENDING),
      }
    );

    setUserActivities(freshActivities || []);

    return freshActivities || [];
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

export const createUserActivity = async (userId, activityData) => {
  try {
    const newActivity = new UserActivity({
      userId: userId,
      type: activityData.type,
      amount: activityData.amount,
      description: activityData.description,
      extra: JSON.stringify({ contribution_id: activityData.extra }) || null,
    });

    await DataStore.save(newActivity);
    return newActivity;
  } catch (error) {
    return error;
  }
};
