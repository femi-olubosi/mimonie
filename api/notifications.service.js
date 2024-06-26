import { DataStore } from 'aws-amplify/datastore';
import { UserNotifications } from '../src/models';

export const fetchUserNotification = async (userId, setNotifications) => {
  try {
    // await DataStore.clear();
    // await DataStore.start();
    // Fetch contributions where the user is a participant
    const userNotifications = await DataStore.query(UserNotifications, (c) =>
      c.userId.eq(userId)
    );
    setNotifications(userNotifications);
    return userNotifications;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
};

export const createNotification = async (details, setNotifications) => {
  try {
    const newNotification = await DataStore.save(
      new UserNotifications(details)
    );
    // setNotifications((prev) => [...prev, newNotification]);
    await fetchUserNotification(details.userId, setNotifications);
    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export async function updateNotification(id, updates) {
  const original = await DataStore.query(UserNotifications, id);

  const updatedNotification = await DataStore.save(
    UserNotifications.copyOf(original, (updated) => {
      Object.keys(updates).forEach((key) => {
        updated[key] = updates[key];
      });
    })
  );

  return updatedNotification;
}

export const deleteNotification = async (notificationId) => {
  try {
    // Query for the contribution to be deleted
    const toDelete = await DataStore.query(UserNotifications, notificationId);

    // Check if the contribution exists
    if (toDelete) {
      // Delete the contribution

      await DataStore.delete(toDelete);
      console.log(
        `Notification with ID ${notificationId} deleted successfully.`
      );
    } else {
      console.log(`Notification with ID ${notificationId} not found.`);
    }
  } catch (error) {
    console.error(
      `Error deleting notification with ID ${notificationId}:`,
      error
    );
  }
};
