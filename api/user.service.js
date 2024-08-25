import {
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
} from 'aws-amplify/auth';
import { downloadData, uploadData } from 'aws-amplify/storage';
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
      `protected/${identityId}/${type}/${fileName}`;

    await uploadData({
      path: uploadPath,
      data: file,
    }).result;

    const { body, eTag } = await downloadData({
      path: uploadPath,
      options: {
        onProgress: (event) => {
          console.log(event.transferredBytes);
        },
      },
    }).result;
    const text = await body.text();
    const blob = await body.blob();
    return text;
  } catch (error) {
    console.error('Error uploading or getting file URL:', error);
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

    // Set up real-time subscription
    const subscription = DataStore.observe(UserProfile).subscribe(
      async (msg) => {
        if (msg.opType === 'UPDATE') {
          const updatedProfile = await DataStore.query(UserProfile, (c) =>
            c.userId.eq(currentUser.userId)
          );

          setUserProfile(updatedProfile[0]);
        }
      }
    );

    return () => subscription.unsubscribe();
    // return userProfile[0];
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
