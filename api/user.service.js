import {
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
} from 'aws-amplify/auth';
import { downloadData, uploadData, getUrl } from 'aws-amplify/storage';
import { UserProfile } from '@/src/models';
import { DataStore } from 'aws-amplify/datastore';

export const fetchCurrUser = async (setCurrentUser) => {
  const user = await getCurrentUser();
  const attribute = await fetchUserAttributes();
  setCurrentUser({
    ...user,
    ...attribute,
  });
  return user;
};

export const uploadFile = async (file, type) => {
  const date = Date.now();
  const fileName = `${date}.jpg`;

  try {
    const uploadPath = ({ identityId }) =>
      `public/${identityId}/${type}/${fileName}`;

    await uploadData({
      path: uploadPath,
      level: 'public',
      data: file,
      options: {
        bucket: {
          bucketName: 'mimonies3storageb7338-dev',
        },
      },
    }).result;
    console.log('yes');
    // const { body, eTag } = await downloadData({
    //   path: uploadPath,
    //   level: 'public',

    //   options: {

    //     onProgress: (event) => {
    //       console.log(event.transferredBytes);
    //     },
    //   },
    // }).result;

    const linkToStorageFile = await getUrl({
      path: uploadPath,
      options: {
        bucket: 'mimonies3storageb7338-dev',
        validateObjectExistence: true,
        useAccelerateEndpoint: true,
      },
    });
    // const text = await body.text();
    // const blob = await body.blob();
    // return text;
    console.log('link', linkToStorageFile);
    return linkToStorageFile.url.toString();
  } catch (error) {
    console.error('Error uploading or getting file URL:', error);
  }
};

// export const uploadFile = async (file, type) => {
//   const date = Date.now();
//   const fileName = `${date}.jpg`;

//   try {
//     const uploadPath = ({ identityId }) => `${identityId}/${type}/${fileName}`;

//     await uploadData({
//       path: uploadPath,
//       data: file,
//     }).result;

//     // Generate a presigned URL
//     const signedUrl = await getSignedUrl({
//       Bucket: 'your-bucket-name',
//       Key: uploadPath,
//       Expires: 60 * 60, // 1 hour
//     });

//     return signedUrl;
//   } catch (error) {
//     console.error('Error uploading or getting file URL:', error);
//   }
// };

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
  { device_id, device_name, device_brand }
) => {
  try {
    const userProfile = await DataStore.save(
      new UserProfile({ userId, device_id, device_name, device_brand })
    );
    return userProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (updatedData, currentUser) => {
  try {
    // Fetch the existing user profile
    const userProfile = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(currentUser.userId)
    );

    // const data = {
    //   ...updatedData,
    // };

    // Update the profile with new data
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
