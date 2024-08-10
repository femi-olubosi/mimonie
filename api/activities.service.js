import { DataStore } from 'aws-amplify/datastore';
import { UserActivity } from '../src/models';

import { debounce } from 'lodash';

const debouncedSetUserActivities = debounce((setUserActivities, data) => {
  setUserActivities(data);
}, 1000);

export const fetchUserActivities = async (
  userId,
  setUserActivities,
  getUserActivities
) => {
  try {
    await DataStore.start();

    // Fetch activities where the user is a participant
    const activities = await DataStore.query(UserActivity, (c) =>
      c.userId.eq(userId)
    );
    const sorted = activities.sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : 1
    );

    setUserActivities(sorted);

    // Set up real-time subscription
    const subscription = DataStore.observe(UserActivity).subscribe(
      async (msg) => {
        if (
          msg.opType === 'INSERT' ||
          msg.opType === 'UPDATE' ||
          msg.opType === 'DELETE'
        ) {
          const updatedActivities = await DataStore.query(UserActivity, (c) =>
            c.userId.eq(userId)
          );
          const sortedUpdated = updatedActivities.sort((a, b) =>
            a.createdAt > b.createdAt ? -1 : 1
          );

          // Compare with the current state before updating
          const currentActivities = getUserActivities();
          if (
            JSON.stringify(currentActivities) !== JSON.stringify(sortedUpdated)
          ) {
            debouncedSetUserActivities(setUserActivities, sortedUpdated);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }
};
