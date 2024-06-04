import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const topBar = Platform.OS === 'android' ? Constants.statusBarHeight : 0;
