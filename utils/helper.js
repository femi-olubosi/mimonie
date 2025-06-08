import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { fetchCurrUser, fetchUserProfile } from '@/api/user.service';
import { sendOtp } from '@/api/token.service';
import { fetchUserActivities } from '@/api/activities.service';

const EXPIRY_LIMIT_DAYS = 7;
const DAY_IN_MS = 86400000;

export const saveDownloadDate = async (date) => {
  try {
    await AsyncStorage.setItem('downloadDate', date.toISOString());
  } catch (error) {
    console.error('Error saving download date:', error);
  }
};

export const getDownloadDate = async () => {
  try {
    const date = await AsyncStorage.getItem('downloadDate');
    return date ? new Date(date) : null;
  } catch (error) {
    console.error('Error fetching download date:', error);
    return null;
  }
};

const getDaysDifference = (date1, date2) => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(timeDiff / DAY_IN_MS);
  return diffDays;
};

export const isAboutToExpire = async () => {
  const downloadDate = await getDownloadDate();
  const today = new Date();

  if (downloadDate) {
    const daysSinceDownload = getDaysDifference(downloadDate, today);
    const daysRemaining = EXPIRY_LIMIT_DAYS - daysSinceDownload;

    return daysRemaining <= 1;
  }
  return true;
};

export const isLastDaysOfMonth = (date) => {
  const testDate = new Date(date);
  testDate.setMonth(testDate.getMonth() + 1);
  testDate.setDate(0); // Last day of current month
  return date.getDate() > testDate.getDate() - 4; // 28th or later
};

export async function onFetchUpdateAsync() {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error(error);
  }
}

export const fetchAndCheckUser = async (
  setCurrentUser,
  setConfirmationResult,
  setUserActivities,
  setProfilePicture,
  setUserProfile,
  setInitializing
) => {
  setInitializing(true);
  try {
    const authUser = await fetchCurrUser(setCurrentUser);

    await fetchUserProfile(setUserProfile, authUser);
    await fetchUserActivities(authUser?.userId, setUserActivities);
    const picture = await AsyncStorage.getItem('profilePicture');
    setProfilePicture(picture);

    const phoneVerified =
      authUser?.phone_number_verified || authUser?.['custom:phone_verified'];

    if (!authUser?.name) {
      setInitializing(false);
      router.push('/(protected)/complete_profile');
    } else if (!phoneVerified) {
      setInitializing(false);
      const res = await sendOtp(authUser?.phone_number);
      setConfirmationResult({ ...res, type: 'phone_verification' });
      router.push('/(protected)/verification_check');
    } else {
      // router.push('/(protected)/(tabs)');
      setInitializing(false);
      console.log(authUser?.name);
    }
  } catch (error) {
    setInitializing(false);
    console.error('Error fetching current user:', error);
  } finally {
    // router.push('/(protected)/(tabs)');
    setInitializing(false);
  }
};
