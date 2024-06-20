import {
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  SafeAreaView,
  View,
  Text,
} from 'react-native';
import Cards from '@/components/home/Cards';
import ProfileView from '@/components/home/ProfileView';
import Options from '@/components/home/Options';
import { ThemedView } from '@/components/ThemedView';
import { useGlobalContext } from '@/store/StoreContext';
import { useEffect } from 'react';
import {
  fetchCurrUser,
  fetchUserProfile,
  updateUserProfile,
} from '@/api/user.service';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { getContacts } from '@/api/contact.service';
import { fetchUserContributions } from '@/api/contributions.service';
import { createSubAccount, getPaystackCustomer } from '@/api/payment.service';

export default function HomeScreen() {
  const {
    currentUser,
    setCurrentUser,
    setUserProfile,
    setIsLoading,
    setMyContacts,
    contributions,
    setContributions,
    userProfile,
  } = useGlobalContext();

  useEffect(() => {
    fetchCurrUser(setCurrentUser);
  }, []);

  useEffect(() => {
    // fetchCurrUser(setCurrentUser);
    fetchUserProfile(setUserProfile, currentUser);
  }, [currentUser]);

  useEffect(() => {
    setIsLoading(true);
    if (currentUser.preferred_username) {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    (async () => {
      await getContacts(setMyContacts);
    })();
  }, []);

  useEffect(() => {
    fetchUserContributions(currentUser.userId, setContributions);
  }, [currentUser]);

  useEffect(() => {
    (async () => {
      if (userProfile && userProfile?.is_bvn_verified !== true) {
        const res = await getPaystackCustomer(userProfile?.customer_code);

        if (res.data.identifications?.length > 0) {
          const subaccount = await createSubAccount(userProfile);
          await updateUserProfile(
            {
              is_bvn_verified: true,
              verification_in_progress: false,
              subaccount_code: subaccount.subaccount_code,
            },
            currentUser
          );
          await fetchUserProfile(setUserProfile, currentUser);
        }
      }
    })();
  }, [userProfile]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFB' }}>
      <StatusBar style="dark" />
      <ThemedView
        style={{
          flex: 1,
          paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
          backgroundColor: '#FAFAFB',
        }}
      >
        <ProfileView
          username={userProfile?.preferred_username}
          picture={currentUser?.picture}
        />
        <Cards contributions={contributions} />
        <Options />
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text>You do not have any activity yet</Text>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
