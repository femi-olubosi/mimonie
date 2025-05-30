import { fetchCurrUser, fetchUserProfile } from '@/api/user.service';
import { sendOtp } from '@/api/token.service';
import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/store/StoreContext';
import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { fetchUserActivities } from '@/api/activities.service';

const index = () => {
  const {
    setCurrentUser,
    setUserProfile,
    setConfirmationResult,
    setUserActivities,
    pushRoute,
  } = useGlobalContext();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetchCurrUser(setCurrentUser);
        const user = await fetchUserProfile(setUserProfile, res);

        if (!user.name) {
          router.push('/protected/complete_profile');
        } else if (!user?.phone_verified) {
          const res = await sendOtp(user.phone_number);
          setConfirmationResult({ ...res, type: 'phone_verification' });
          router.push('/verification_check');
        } else {
          await fetchUserActivities(user?.userId, setUserActivities);
          console.log(user?.name);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.pri }}>
      <Redirect href={'/(protected)'} />
    </View>
  );
};

export default index;
