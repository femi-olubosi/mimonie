import {
  registerForPushNotificationsAsync,
  savePushToken,
} from '@/api/pushNotification.service';
import { useEffect, useState } from 'react';

const usePushNotifications = (currentUser: any) => {
  const [pushActive, setPushActive] = useState(false);

  useEffect(() => {
    const registerPushToken = async () => {
      try {
        const pushToken = await registerForPushNotificationsAsync();

        if (pushToken && currentUser) {
          await savePushToken(currentUser, pushToken);
        }
      } catch (error) {
        console.log('Failed to get push token:', error);
      }
    };

    if (currentUser && !pushActive) {
      registerPushToken();
      setPushActive(true);
    }
  }, [currentUser, pushActive]);
};

export default usePushNotifications;
