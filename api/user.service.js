import {
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
} from 'aws-amplify/auth';
import { downloadData, uploadData, getUrl } from 'aws-amplify/storage';
import { UserProfile } from '@/src/models';
import { DataStore } from 'aws-amplify/datastore';
import { del, get } from 'aws-amplify/api';

export const fetchCurrUser = async (setCurrentUser) => {
  try {
    const user = await getCurrentUser();
    const attribute = await fetchUserAttributes();
    const userData = {
      ...user,
      ...attribute,
    };
    setCurrentUser(userData);
    return userData;
  } catch (error) {
    throw error;
  }
};

export const uploadFile = async (file, userId) => {
  const uploadPath = `public/profile/${userId}-profile.jpg`;
  try {
    const response = await fetch(file.uri);
    const img = await response.blob();

    await uploadData({
      path: uploadPath,
      data: img,
      options: {
        contentType: file.type || 'image/jpeg',
        // contentEncoding: 'compress',
      },
    }).result;

    const fileUrl = `https://mimonies3storageb7338-dev.s3.us-west-2.amazonaws.com/${uploadPath}`;
    console.log('res', fileUrl);
    return fileUrl;
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
  await updateUserAttributes({
    userAttributes: data,
  });
};

export const fetchUserProfile = async (setUserProfile, currentUser) => {
  try {
    const userProfile = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(currentUser.userId)
    );

    setUserProfile(userProfile[0]);
    return userProfile[0];
  } catch (error) {
    console.error('Error fetching user user profile:', error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const restOperation = get({
      apiName: 'userInfo',
      path: `/user-info/${userId}`,
    });

    const response = await restOperation?.response;
    const profile = await response?.body?.json();

    return profile?.data;
  } catch (error) {
    // console.log('GET call failed: ', JSON.parse(error.response.body));
    throw error;
  }
};

export const fetchUserProfileForInvite = async (userId) => {
  try {
    const userProfile = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(userId)
    );

    return userProfile[0];
    // const restOperation = get({
    //   apiName: 'userInfo',
    //   path: `/user-info/${userId}`,
    // });

    // const response = await restOperation.response;
    // const profile = await response.body.json();

    // return profile.data;
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
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error fetching user user device id:', error);
    return false;
  }
};

export const isPhoneNumberExist = async (phone_number) => {
  try {
    // const phoneNumbers = await DataStore.query(UserProfile, (c) =>
    //   c.phone_number.eq(phone_number)
    // );

    const encodedPhone = encodeURIComponent(phone_number);
    const restOperation = get({
      apiName: 'userInfo',
      path: `/user-info/phone/${encodedPhone}`,
    });

    const response = await restOperation?.response;
    const phone = await response?.body?.json();

    if (phone) {
      return true;
    }

    // if (phoneNumbers && phoneNumbers.length > 0) {
    //   return true;
    // }

    return false;
  } catch (error) {
    // console.log('GET call failed: ', JSON.parse(error.response.body));
    return false;
  }
};

export const createUserProfile = async (
  userId,
  { device_id, device_name, device_brand },
  email,
  phone_number
) => {
  try {
    // const postData = {
    //   userId,
    //   device_id,
    //   device_name,
    //   device_brand,
    //   email,
    //   phone_number,
    // };
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

    // const restOperation = post({
    //   apiName: 'userInfo',
    //   path: `/user-info`,
    //   options: {
    //     body: postData,
    //   },
    // });

    // const response = await restOperation.response;
    // const profile = await response.body.json();
    return userProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  updatedData,
  currentUser,
  userProfile
) => {
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
    // const restOperation = put({
    //   apiName: 'userInfo',
    //   path: `/user-info/${userProfile.id}`,
    //   options: {
    //     body: updatedData,
    //   },
    // });

    // const response = await restOperation.response;
    // const profile = await response.body.json();
    // return profile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const fetchAllUserProfile = async () => {
  try {
    const userProfile = await DataStore.query(UserProfile);
    console.log('all', userProfile);
    return userProfile;
  } catch (error) {
    console.error('Error fetching user user profile:', error);
    return [];
  }
};

export const checkUser = async (phone) => {
  try {
    const encodedPhone = encodeURIComponent(phone);
    const restOperation = get({
      apiName: 'userInfo',
      path: `/user-info/phone/${encodedPhone}`,
    });

    const response = await restOperation?.response;
    const user = await response?.body?.json();
    return user?.data;
  } catch (error) {
    // console.log('GET call failed: ', JSON.parse(error.response.body));
    return null;
  }
};

export const fetchProfile = async (currentUser) => {
  try {
    const userProfile = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(currentUser.userId)
    );

    return userProfile[0];
  } catch (error) {
    console.error('Error fetching user user profile:', error);
    throw error;
  }
};

export const wakeUp = async (userId) => {
  try {
    const restOperation = get({
      apiName: 'userInfo',
      path: `/user-info/${userId}`,
    });

    const response = await restOperation?.response;
    const profile = await response?.body?.json();

    return profile?.data;
  } catch (error) {
    console.log('GET call failed: ', JSON.parse(error.response.body));
    // throw error;
    return { success: false, message: 'User profile not found' };
  }
};

export const deleteUserProfile = async (userProfile) => {
  try {
    const restOperation = del({
      apiName: 'userInfo',
      path: `/user-info/${userProfile.id}?email=${encodeURIComponent(
        userProfile.email
      )}`,
    });

    const response = await restOperation?.response;
    const backendResponse = await response?.body?.json();

    return backendResponse?.data;
  } catch (error) {
    console.log('DELETE call failed: ', error);
    throw error;
  }
};
