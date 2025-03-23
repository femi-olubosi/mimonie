import {
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
} from 'aws-amplify/auth';
import { downloadData, uploadData, getUrl } from 'aws-amplify/storage';
import { UserProfile } from '@/src/models';
import { DataStore } from 'aws-amplify/datastore';
import { Storage } from 'aws-amplify';
import { Buffer } from 'buffer';
import { safeParseJSON } from '@/utils/safeJSON';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchCurrUser = async (setCurrentUser) => {
  const user = await getCurrentUser();
  const attribute = await fetchUserAttributes();
  setCurrentUser({
    ...user,
    ...attribute,
  });
  return user;
};

export const uploadFile = async (file, userId) => {
  const uploadPath = `public/profile/${userId}-profile.jpg`;
  try {
    const response = await fetch(file);
    const img = await response.blob();

    const res = await uploadData({
      path: uploadPath,
      data: img,
      options: {
        contentType: 'image/jpeg',
        // contentEncoding: 'compress',
      },
    }).result;
    console.log('res', res);
    return res;
  } catch (error) {
    console.error('Error uploading or getting file URL:', error);
  }
};

export const downloadFile = async (userId) => {
  const uploadPath = `public/profile/${userId}-profile.jpg`;
  try {
    const { body } = await downloadData({
      path: uploadPath,
    }).result;

    const imageBlob = await body.blob();

    return URL.createObjectURL(imageBlob);
  } catch (e) { }
};

export const downloadUrl = async (userId) => {
  try {
    const uploadPath = `public/profile/${userId}-profile.jpg`;
    const linkToStorageFile = await getUrl({
      path: uploadPath,
      expires: 604800,
    });

    return linkToStorageFile.url.toString();
  } catch (err) {
    console.error('Error downloading file:', err);
    return null;
  }
};

export const checkLinkExpiry = async (link) => {
  try {
    const response = await fetch(link);
    return response.status === 403;
  } catch (error) {
    if (error.name === 'HTTPError' && error.status === 403) {
      return true;
    }
    console.error('Error checking link expiration:', error);
    return false;
  }
};

export const updateAttributes = async (data) => {
  const {
    signInDetails,
    sub,
    userId,
    email_verified,
    phone_number_verified,
    username,
    preferred_username,
    email,
    occupation,
    income_from,
    income_to,
    country_of_origin,
    country_of_residence,
    ...rest
  } = data;
  const res = await updateUserAttributes({
    userAttributes: rest,
  });
};

export const fetchUserProfile = async (setUserProfile, currentUser) => {
  try {
    // await DataStore.clear();
    await DataStore.start();

    const userProfile = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(currentUser.userId)
    );
    setUserProfile(userProfile[0]);
    return userProfile[0];
  } catch (error) {
    console.error('Error fetching user user profile:', error);
    return [];
  }
};

export const fetchUserProfileForInvite = async (userId) => {
  try {
    const userProfile = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(userId)
    );

    return userProfile[0];
  } catch (error) {
    console.error('Error fetching user user profile:', error);
    return [];
  }
};

export const isDeviceExist = async (device_id) => {
  try {
    const device_ids = await DataStore.query(UserProfile, (c) =>
      c.device_id.eq(device_id)
    );

    if (device_ids && device_ids.length > 0) {
      return { status: true, email: device_ids[0]?.email }
    }
    return { status: false }
  } catch (error) {
    console.error('Error fetching user user device id:', error);
    return false
  }
};

export const createUserProfile = async (
  userId,
  { device_id, device_name, device_brand },
  email,
  phone_number
) => {
  try {
    const userProfile = await DataStore.save(
      new UserProfile({
        userId,
        device_id,
        device_name,
        device_brand,
        email,
        phone_number,
      })
    );
    return userProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (updatedData, currentUser) => {
  try {
    const userProfile = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(currentUser.userId)
    );

    const updatedProfile = await DataStore.save(
      UserProfile.copyOf(userProfile[0], (updated) => {
        Object.assign(updated, updatedData);
      })
    );

    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const fetchAllUserProfile = async () => {
  try {
    // await DataStore.clear();
    await DataStore.start();
    // Fetch contributions where the user is a participant
    const userProfile = await DataStore.query(UserProfile);
    console.log('all', userProfile);
    return userProfile;
  } catch (error) {
    console.error('Error fetching user user profile:', error);
    return [];
  }
};

export const fetchExistingUser = async (contacts, type) => {
  try {
    if (type === 'auto') {
      const storedUsers = await AsyncStorage.getItem('cachedExistingUsers');
      if (storedUsers) {
        return JSON.parse(storedUsers);
      }
    }
    // Function to normalize phone numbers
    const normalizePhoneNumber = (phone) => {
      if (!phone || typeof phone !== "string") return null;

      // Remove spaces, dashes, and parentheses
      const sanitizedPhone = phone.replace(/[\s-()]/g, '');

      if (sanitizedPhone.startsWith('+')) {
        return sanitizedPhone;
      }

      // Handle local Nigerian numbers (e.g., `08139781147`)
      if (/^0[789][01]\d{8}$/.test(sanitizedPhone)) {
        return `+234${sanitizedPhone.slice(1)}`; // Replace leading `0` with `+234`
      }

      // Return the sanitized phone if no transformation is applied
      return sanitizedPhone;
    };

    // Normalize all contact phone numbers
    const normalizedContacts = contacts.map(contact => ({
      ...contact,
      phoneNumbers: contact.phoneNumbers.map(normalizePhoneNumber).filter(Boolean)
    }));

    // Collect all unique normalized phone numbers
    const uniquePhoneNumbers = [...new Set(normalizedContacts.flatMap(contact => contact.phoneNumbers))];

    const batchSize = 500;
    const userProfiles = [];

    for (let i = 0; i < uniquePhoneNumbers.length; i += batchSize) {
      const batch = uniquePhoneNumbers.slice(i, i + batchSize);
      const profiles = await DataStore.query(UserProfile, (c) =>
        c.or((c1) => batch.map((phone) => c1.phone_number.eq(phone)))
      );
      userProfiles.push(...profiles);
    }

    // Create a map of phone numbers to user profiles for quick lookup
    const phoneToProfileMap = new Map();
    userProfiles.forEach(profile => {
      const normalizedPhone = normalizePhoneNumber(profile.phone_number);
      if (normalizedPhone) {
        phoneToProfileMap.set(normalizedPhone, profile);
      }
    });

    // Map contacts to find matches in user profiles
    const matchedUsers = normalizedContacts.map(contact => {
      const matchingProfile = contact.phoneNumbers.find(phone => phoneToProfileMap.has(phone));

      if (matchingProfile) {
        const profile = phoneToProfileMap.get(matchingProfile);
        return {
          name: contact.name,
          phoneNumbers: contact.phoneNumbers,
          userProfile: profile,
          userId: profile.userId,
          connections: safeParseJSON(profile.connections) || [],
        };
      }

      return null;
    });

    const existingUsers = matchedUsers.filter(match => match !== null);

    // Cache the results in AsyncStorage
    await AsyncStorage.setItem('cachedExistingUsers', JSON.stringify(existingUsers));

    return existingUsers
  } catch (error) {
    console.error('Error fetching and matching user profiles:', error);
    return [];
  }
};