import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../store/StoreContext';
import { useAuthenticator } from '@aws-amplify/ui-react-native';

// Inactivity timeout set to 4 minutes
const INACTIVITY_TIMEOUT = 4 * 60 * 1000;

const UserInactivityProvider = ({ children }) => {
  const appState = useRef(AppState.currentState);
  const { setIsAuth } = useGlobalContext();
  const { signOut } = useAuthenticator();

  const recordStartTime = async () =>
    await AsyncStorage.setItem('lastActiveTime', Date.now().toString());

  const handleAppStateChange = async (nextAppState) => {
    if (nextAppState === 'background') {
      await recordStartTime();
    }

    if (nextAppState === 'active' && appState.current === 'background') {
      const lastActiveTime = await AsyncStorage.getItem('lastActiveTime');

      if (lastActiveTime) {
        if (Date.now() - Number(lastActiveTime) >= INACTIVITY_TIMEOUT) {
          setIsAuth(null);
          await AsyncStorage.removeItem('isAuth');
          signOut();
        } else {
          await recordStartTime();
        }
      }
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    recordStartTime();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => subscription.remove();
  }, []);

  return children;
};

export default UserInactivityProvider;
