import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { fetchCurrUser, fetchUserProfile, getUser } from '@/api/user.service';
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
  setUserProfile
) => {
  try {
    const authUser = await fetchCurrUser(setCurrentUser);

    if (!authUser) {
      console.log('Helper: No authenticated user found, returning /');
      throw new Error('No authenticated user found');
    }

    const userProfile = await getUser(authUser);
    // await fetchUserProfile(setUserProfile, authUser);
    // setUserProfile(userProfile);
    await fetchUserActivities(authUser?.userId, setUserActivities, 20);

    const picture = await AsyncStorage.getItem('profilePicture');
    setProfilePicture(picture);

    const phoneVerified =
      authUser?.phone_number_verified || authUser?.['custom:phone_verified'];

    if (!userProfile?.name) {
      return '/(protected)/complete_profile';
    } else if (!phoneVerified) {
      const res = await sendOtp(authUser?.phone_number);
      setConfirmationResult({ ...res, type: 'phone_verification' });
      return '/(protected)/verification_check';
    } else {
      return '/(protected)/(tabs)';
    }
  } catch (error) {
    throw error;
  }
};

export const sevenDaysAgo = new Date(
  Date.now() - 7 * 24 * 60 * 60 * 1000
).toISOString();

export function formatNigerianPhoneNumber(phone) {
  if (typeof phone !== 'string') {
    phone = String(phone);
  }

  // Remove whitespace, dashes, parentheses, etc.
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Nigerian formats
  const localPattern = /^0\d{10}$/;
  const intlPattern = /^\+234\d{10}$/;
  const rawIntlPattern = /^234\d{10}$/;

  if (intlPattern.test(cleaned)) {
    // Already properly formatted
    return cleaned;
  }

  if (localPattern.test(cleaned)) {
    // Convert from 080... to +23480...
    return '+234' + cleaned.slice(1);
  }

  if (rawIntlPattern.test(cleaned)) {
    // Convert from 23480... to +23480...
    return '+' + cleaned;
  }

  // Not Nigerian, return original
  return phone;
}
