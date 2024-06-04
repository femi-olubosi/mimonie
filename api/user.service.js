import {
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
} from 'aws-amplify/auth';
import { post, get } from 'aws-amplify/api';
import { downloadData, uploadData } from 'aws-amplify/storage';

export const fetchCurrUser = async (setCurrentUser) => {
  const user = await getCurrentUser();
  const attribute = await fetchUserAttributes();
  setCurrentUser({
    ...user,
    ...attribute,
  });
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
    ...rest
  } = data;
  const res = await updateUserAttributes({
    userAttributes: rest,
  });
};

export const getUserInfo = async (setUserInfo) => {
  //   try {
  //     const restOperation = get({
  //       apiName: 'userInfo',
  //       path: '/user-info',
  //     });
  //     const { body } = await restOperation.response;
  //     const json = await body.json();
  //     console.log('GET call succeeded: ', json);
  //     // return response;
  //   } catch (e) {
  //     console.log('GET call failed: ', JSON.parse(e.response.body));
  //   }
};
