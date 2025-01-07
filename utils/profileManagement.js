import AsyncStorage from '@react-native-async-storage/async-storage';
import { downloadUrl } from '../api/user.service';

const PROFILE_PIC_EXPIRATION_DAYS = 7;
const MS_IN_A_DAY = 24 * 60 * 60 * 1000;

export const isExpired = (timestamp) => {
  if (!timestamp) return true;

  const currentTime = Date.now();
  return currentTime - timestamp > PROFILE_PIC_EXPIRATION_DAYS * MS_IN_A_DAY;
};

export const fetchAndStoreProfilePicture = async (userId) => {
  try {
    const remotePicture = await downloadUrl(userId);
    if (remotePicture) {
      const newEntry = {
        url: remotePicture,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('profilePicture', JSON.stringify(newEntry));

      console.log('Fetched and saved new profile picture URL.');
      return remotePicture;
      // setProfilePicture(remotePicture);
    } else {
      console.log('Failed to download profile picture');
      return null;
      // setProfilePicture(null);
    }
  } catch (error) {
    throw new Error('Failed to fetch and store profile picture');
  }
};
