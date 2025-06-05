import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/store/StoreContext';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { fetchAndCheckUser } from '@/utils/helper';

const index = () => {
  const {
    setCurrentUser,
    setConfirmationResult,
    setUserActivities,
    setProfilePicture,
  } = useGlobalContext();

  useEffect(() => {
    fetchAndCheckUser(
      setCurrentUser,
      setConfirmationResult,
      setUserActivities,
      setProfilePicture
    );
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.pri }}>
      <Redirect href={'/(protected)/(tabs)'} />
    </View>
  );
};

export default index;
