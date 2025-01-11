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

// export const fetchExistingUser = async (contacts) => {
//   try {
//     // Query all user profiles from DataStore
//     const userProfiles = await DataStore.query(UserProfile);

//     if (!Array.isArray(userProfiles) || userProfiles.length === 0) {
//       console.warn('No user profiles found in DataStore.');
//       return [];
//     }

//     // Map contacts to find matches in user profiles
//     const matchedUsers = contacts.map((contact) => {
//       // Ensure contact.phoneNumbers is an array
//       if (!Array.isArray(contact.phoneNumbers)) {
//         console.warn(`Contact ${contact.name} has invalid phoneNumbers.`);
//         return null;
//       }

//       // Find a matching user profile based on phone number
//       const matchingProfile = userProfiles.find((profile) => {
//         if (!profile.phone_number) return false; // Skip profiles with null or undefined phone_number
//         return contact.phoneNumbers.some((phone) => {
//           if (!phone) return false; // Skip null or undefined phone numbers
//           return (
//             phone.replace(/\s+/g, '').replace(/^\+/, '') ===
//             profile.phone_number.replace(/\s+/g, '').replace(/^\+/, '')
//           );
//         });
//       });

//       if (matchingProfile) {
//         return {
//           name: contact.name,
//           phoneNumbers: contact.phoneNumbers,
//           userProfile: matchingProfile,
//           userId: matchingProfile.userId,
//           connections: safeParseJSON(matchingProfile.connections) || [],
//         };
//       }

//       return null;
//     });

//     // Filter out unmatched contacts
//     return matchedUsers.filter((match) => match !== null);
//   } catch (error) {
//     console.error('Error fetching and matching user profiles:', error);
//     return [];
//   }
// };

export const fetchExistingUser = async (contacts) => {
  try {
    // Function to normalize phone numbers
    const normalizePhoneNumber = (phone) => {
      if (!phone) return null;

      // Remove spaces, dashes, and parentheses
      const sanitizedPhone = phone.replace(/[\s-()]/g, '');

      // If the phone starts with `+`, assume it's already in international format
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

    // Query all user profiles from DataStore
    const userProfiles = await DataStore.query(UserProfile);

    if (!Array.isArray(userProfiles) || userProfiles.length === 0) {
      console.warn('No user profiles found in DataStore.');
      return [];
    }

    // Map contacts to find matches in user profiles
    const matchedUsers = contacts.map((contact) => {
      if (!Array.isArray(contact.phoneNumbers)) {
        console.warn(`Contact ${contact.name} has invalid phoneNumbers.`);
        return null;
      }

      // Find a matching user profile based on normalized phone number
      const matchingProfile = userProfiles.find((profile) => {
        if (!profile.phone_number) return false; // Skip profiles without a phone number
        const normalizedProfilePhone = normalizePhoneNumber(
          profile.phone_number
        );
        return contact.phoneNumbers.some((phone) => {
          const normalizedContactPhone = normalizePhoneNumber(phone);
          return (
            normalizedContactPhone &&
            normalizedProfilePhone &&
            normalizedContactPhone === normalizedProfilePhone
          );
        });
      });

      if (matchingProfile) {
        return {
          name: contact.name,
          phoneNumbers: contact.phoneNumbers,
          userProfile: matchingProfile,
          userId: matchingProfile.userId,
          connections: safeParseJSON(matchingProfile.connections) || [],
        };
      }

      return null;
    });

    // Filter out unmatched contacts
    return matchedUsers.filter((match) => match !== null);
  } catch (error) {
    console.error('Error fetching and matching user profiles:', error);
    return [];
  }
};
