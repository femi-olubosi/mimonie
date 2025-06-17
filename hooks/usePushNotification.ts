import {
  registerForPushNotificationsAsync,
  savePushToken,
} from '@/api/pushNotification.service';
import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';

const usePushNotifications = (currentUser: any, userProfile: any) => {
  const [pushActive, setPushActive] = useState(false);

  useEffect(() => {
    const registerPushToken = async () => {
      try {
        const pushToken = await registerForPushNotificationsAsync();

        if (pushToken && currentUser) {
          await savePushToken(currentUser, pushToken, userProfile);
        }
      } catch (error) {
        console.log('Failed to get push token:', error);
      }
    };

    if (currentUser && userProfile?.name && !pushActive) {
      registerPushToken();
      setPushActive(true);
    }
  }, [currentUser, pushActive, userProfile]);
};

export default usePushNotifications;

export function useHandleNotifications() {
  const [lastNotificationResponse, setLastNotificationResponse] = useState<
    Notifications.NotificationResponse | undefined
  >();

  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification response received (user tapped):', response);
        setLastNotificationResponse(response);
      });

    return () => {
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return { lastNotificationResponse };
}
