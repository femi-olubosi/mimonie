import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useGetPushTokenFromLocalStorage = () => {
  const [pushToken, setPushToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const tokenStr = await AsyncStorage.getItem('pushToken');
        if (tokenStr) {
          setPushToken(JSON.parse(tokenStr));
        }
      } catch (error) {
        console.error('Error loading push token:', error);
      }
    };

    loadToken();
  }, []);

  return pushToken;
};
