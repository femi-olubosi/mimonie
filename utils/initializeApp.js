import AsyncStorage from '@react-native-async-storage/async-storage';
import { onFetchUpdateAsync } from './helper';
import mobileAds from 'react-native-google-mobile-ads';

export default initializeApp = async (setOnboard) => {
  try {
    if (!__DEV__) {
      await onFetchUpdateAsync();
    }
    // Check first launch
    const isFirstLaunch = await AsyncStorage.getItem('hasLaunched');
    setOnboard(isFirstLaunch === null);
    if (isFirstLaunch === null) {
      await AsyncStorage.setItem('hasLaunched', 'true');
    }

    await mobileAds().initialize();
  } catch (error) {
    console.error('Initialization error:', error);
  }
};
