import { OneSignal, LogLevel } from 'react-native-onesignal';
import { useEffect } from 'react';

export function useOneSignalSetup(user: {
  userId: string;
  email?: string;
  phone_number?: string;
}) {
  useEffect(() => {
    if (!user?.userId) return;

    const setupOneSignal = async () => {
      try {
        OneSignal.Debug.setLogLevel(LogLevel.Verbose);
        OneSignal.login(user.userId);

        const hasPermission =
          await OneSignal.Notifications.getPermissionAsync();

        if (!hasPermission) {
          await OneSignal.Notifications.requestPermission(true);
        }

        if (user.email) {
          OneSignal.User.addEmail(user.email);
        }

        if (user.phone_number) {
          OneSignal.User.addSms(user.phone_number);
        }

        console.log('OneSignal setup completed.');
      } catch (err) {
        console.error('Error setting up OneSignal:', err);
      }
    };

    setupOneSignal();
  }, [user?.userId]);
}
