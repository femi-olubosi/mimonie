import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/store/StoreContext';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { fetchAndCheckUser } from '@/utils/helper';

const index = () => {
  const [initializing, setInitializing] = useState(false);
  const {
    setCurrentUser,
    setConfirmationResult,
    setUserActivities,
    setProfilePicture,
    setUserProfile,
  } = useGlobalContext();

  useEffect(() => {
    fetchAndCheckUser(
      setCurrentUser,
      setConfirmationResult,
      setUserActivities,
      setProfilePicture,
      setUserProfile,
      setInitializing
    );
  }, []);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.pri,
        }}
      >
        <ActivityIndicator size="large" color={'white'} />
        <Text style={{ fontSize: 12, color: 'white', marginTop: 5 }}>
          Preparing
        </Text>
      </View>
    );
  }

  return <Redirect href={'/(protected)/(tabs)'} />;
};

export default index;
