import { OneSignal } from 'react-native-onesignal';
import { useEffect, useRef } from 'react';

export function useOneSignalSetup(user: {
  userId: string;
  email?: string;
  phone_number?: string;
}) {
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!user.userId || hasRequested.current) return;
    OneSignal.login(user.userId);

    if (user.email) OneSignal.User.addEmail(user.email);
    if (user.phone_number) OneSignal.User.addSms(user.phone_number);

    OneSignal.Notifications.requestPermission(false);
    console.log('completed');
  }, [user.userId]);
}
