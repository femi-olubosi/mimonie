import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { updateUserProfile } from './user.service';

// Set the notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  // Set notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Check if the device is a physical device (no push notifications on simulators)
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if it hasn't been granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If permission is granted, get the push token
    if (finalStatus === 'granted') {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push Token:', token);
    } else {
      console.log('Failed to get push token: Permission not granted');
    }
  } else {
    console.log('Must use a physical device to receive push notifications');
  }

  return token;
}

// Function to save the push token to the backend
export async function savePushToken(currentUser, pushToken) {
  try {
    await updateUserProfile({ push_token: pushToken }, currentUser);
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

// Function to send push notification with custom details
// export async function sendCustomPushNotification(
//   expoPushToken,
//   title,
//   body,
//   data = {}
// ) {
//   const message = {
//     to: expoPushToken,
//     sound: 'default',
//     title,
//     body,
//     data,
//   };

//   await fetch('https://exp.host/--/api/v2/push/send', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Accept-encoding': 'gzip, deflate',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(message),
//   });
// }

export async function sendCustomPushNotification(
  expoPushToken,
  title,
  body,
  data = {}
) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error sending notification: ${response.status} - ${errorData.error}`
      );
    }

    // If everything is fine, log or return success
    const result = await response.json();
    console.log('Notification sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error in sendCustomPushNotification:', error.message);
    throw error; // Rethrow the error to be caught by the caller
  }
}

// Function to trigger a push notification to a specific user
// export async function triggerNotificationForUser(
//   expoPushToken,
//   title,
//   body,
//   data = {}
// ) {
//   if (expoPushToken) {
//     await sendCustomPushNotification(expoPushToken, title, body, data);
//   } else {
//     throw new Error('Expo Push Token not available');
//   }
// }

export async function triggerNotificationForUser(
  expoPushToken,
  title,
  body,
  data = {}
) {
  try {
    if (expoPushToken) {
      await sendCustomPushNotification(expoPushToken, title, body, data);
    } else {
      throw new Error('Expo Push Token not available');
    }
  } catch (error) {
    console.error('Error in triggerNotificationForUser:', error.message);
    // Optionally, you can handle the error further here
  }
}
