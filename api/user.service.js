import { getCurrentUser } from 'aws-amplify/auth';
import { fetchUserAttributes } from 'aws-amplify/auth';

export const fetchCurrUser = async (setCurrentUser) => {
  const { username, userId, signInDetails } = await getCurrentUser();
  const { email } = await fetchUserAttributes();

  setCurrentUser({
    username,
    userId,
    signInDetails,
    email,
  });
};
