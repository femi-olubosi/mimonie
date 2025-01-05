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
  } catch (e) {}
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
    // Fetch contributions where the user is a participant
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
