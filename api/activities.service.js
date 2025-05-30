import { DataStore } from 'aws-amplify/datastore';
import { Contribution, UserActivity } from '../src/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchUserActivities = async (userId, setUserActivities) => {
  const storageKey = `user_activities_${userId}`;

  try {
    // 1. Try to load from AsyncStorage first
    const cached = await AsyncStorage.getItem(storageKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      setUserActivities(parsed);
    }

    // 2. Then fetch fresh data from DataStore in the background
    await DataStore.start(); // optional but safe
    const freshActivities = await DataStore.query(UserActivity, (c) =>
      c.userId.eq(userId)
    );

    const sorted = freshActivities.sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : 1
    );

    // 3. Update state and cache
    setUserActivities(sorted);
    await AsyncStorage.setItem(storageKey, JSON.stringify(sorted));

    return sorted;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }
};

export const fetchHomeUserActivities = async (userId) => {
  try {
    await DataStore.start();

    const activities = await DataStore.query(
      UserActivity,
      (c) => c.userId.eq(userId),
      {
        page: 0, // First page
        limit: 2, // Only 2 results
      }
    );

    console.log('act', activities);

    const sorted = activities.sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : 1
    );

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
      extra: JSON.stringify({ contribution_id: activityData.extra }) || null,
    });

    await DataStore.save(newActivity);
    return newActivity;
  } catch (error) {
    return error;
  }
};
