import * as Linking from 'expo-linking';

export const callbackUrl = () => {
  return Linking.createURL('mimonie');
};
