import { signOut } from 'aws-amplify/auth';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { sendOtp } from '../api/token.service';

export const handleProfileChecks = async (profile, setConfirmationResult) => {
  if (!profile?.name) {
    router.push('/complete_profile');
    return false;
  }

  const phoneIsVerified =
    profile?.phone_number_verified ||
    profile?.['custom:phone_verified'] ||
    profile?.['custom:phone'];

  if (profile.email !== 'admin@mountspiral.com' && !phoneIsVerified) {
    Alert.alert(
      'Phone Number is not verified',
      `Please verify your phone number to continue`,
      [
        {
          text: 'Cancel',
          onPress: () => signOut(),
          style: 'cancel',
        },
        {
          text: 'Okay',
          onPress: async () => {
            const res = await sendOtp(profile.phone_number);
            setConfirmationResult({ ...res, type: 'phone_verification' });
            router.push('/verification_check');
          },
        },
      ],
      { cancelable: false }
    );
    return false;
  }

  if (
    !['+2348139781147', '+2348039013901'].includes(profile?.phone_number) &&
    profile?.['custom:device_id'] &&
    profile?.['custom:device_id'] !== Device.osInternalBuildId
  ) {
    Alert.alert(
      'Device Mismatch',
      `This user is already signed in on another device. Do you want to register this new device?`,
      [
        {
          text: 'Cancel',
          onPress: () => signOut(),
          style: 'cancel',
        },
        {
          text: 'Register',
          onPress: async () => {
            const res = await sendOtp(profile.phone_number);
            setConfirmationResult({ ...res, type: 'device_registration' });
            router.push('/verification_check');
          },
        },
      ],
      { cancelable: false }
    );
    return false;
  }

  return true;
};
