import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'aws-amplify/auth';
import { useGlobalContext } from '../store/StoreContext';

const INACTIVITY_TIMEOUT = 2 * 60 * 1000;

const UserInactivityProvider = ({ children }) => {
  const appState = useRef(AppState.currentState);
  const { setIsAuth } = useGlobalContext();

  const recordStartTime = async () =>
    await AsyncStorage.setItem('lastActiveTime', Date.now().toString());

  const handleAppStateChange = async (nextAppState) => {
    if (nextAppState === 'background') await recordStartTime();
    if (nextAppState === 'active' && appState.current === 'background') {
      const lastActiveTime = await AsyncStorage.getItem('lastActiveTime');
      if (Date.now() - Number(lastActiveTime) >= INACTIVITY_TIMEOUT) {
        setIsAuth(null);
        await AsyncStorage.removeItem('isAuth');
        signOut();
      }
    }
    // console.log(nextAppState);
    appState.current = nextAppState;
  };

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
