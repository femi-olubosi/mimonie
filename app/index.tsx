import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/store/StoreContext';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { fetchAndCheckUser } from '@/utils/helper';

const index = () => {
  const {
    setCurrentUser,
    setUserProfile,
    setConfirmationResult,
    setUserActivities,
    setProfilePicture,
  } = useGlobalContext();

  useEffect(() => {
    fetchAndCheckUser(
      setCurrentUser,
      setUserProfile,
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
