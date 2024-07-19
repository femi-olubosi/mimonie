import {
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  SafeAreaView,
  View,
  Text,
  Pressable,
  Alert,
} from 'react-native';
import Cards from '@/components/home/Cards';
import ProfileView from '@/components/home/ProfileView';
import Advert from '@/components/home/Advert';
import Options from '@/components/home/Options';
import { ThemedView } from '@/components/ThemedView';
import { useGlobalContext } from '@/store/StoreContext';
import { useEffect, useState } from 'react';
import {
  fetchCurrUser,
  fetchUserProfile,
  updateUserProfile,
} from '@/api/user.service';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { getContacts } from '@/api/contact.service';
import { fetchUserContributions } from '@/api/contributions.service';
import { fetchUserNotification } from '@/api/notifications.service';
import { createSubAccount, getPaystackCustomer } from '@/api/payment.service';
import { callbackUrl } from '@/utils/callbackUrl';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { notificationIcon } from '@/utils/notificationsIcon';
import { sendUserAttributeVerificationCode } from 'aws-amplify/auth';
import { isLoading } from 'expo-font';

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
    setNotifications,
    notifications,
  } = useGlobalContext();
  const [alertShown, setAlertShown] = useState(false);

  useEffect(() => {
    fetchCurrUser(setCurrentUser);
  }, []);

  useEffect(() => {
    fetchUserProfile(setUserProfile, currentUser);
  }, [currentUser]);

  useEffect(() => {
    setIsLoading(true);
    if (userProfile) {
      setIsLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    (async () => {
      await getContacts(setMyContacts);
    })();
  }, []);

  useEffect(() => {
    fetchUserContributions(currentUser.userId, setContributions);
  }, [currentUser]);

  useEffect(() => {
    fetchUserNotification(currentUser.userId, setNotifications);
  }, [currentUser]);

  useEffect(() => {
    if (!isLoading) {
      if (currentUser.phone_number_verified !== 'true' && !alertShown) {
        setAlertShown(true);
        Alert.alert(
          'Verification',
          'Please Verify your phone number',
          [
            {
              text: 'Verify Now',
              onPress: async () => {
                await sendUserAttributeVerificationCode({
                  userAttributeKey: 'phone_number',
                });
                router.push('/protected/device_verify');
              },
            },
          ],
          { cancelable: false }
        );
      }
    }
  }, [currentUser, alertShown, isLoading]);

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
          name={userProfile?.name}
          picture={currentUser?.picture}
          notifications={notifications}
        />
        <ScrollView contentContainerStyle={{}}>
          <Cards contributions={contributions} />
          <Options />
          <Advert />
          <View
            style={{ paddingHorizontal: 20, backgroundColor: 'white', flex: 1 }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: 'esb', fontSize: 20 }}>
                Recent Activities
              </Text>
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  columnGap: 4,
                }}
                onPress={() => router.push('/protected/activities')}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'ir',
                    color: '#9095A1',
                  }}
                >
                  {'See all'}
                </Text>
                <FontAwesome name="angle-right" size={16} color="gray" />
              </Pressable>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 20,
                paddingVertical: 20,
              }}
            >
              {notifications.map((e, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      borderWidth: 1,
                      borderRadius: 8,
                      minHeight: 74,
                      borderColor: '#DEE1E6',
                      width: '100%',
                      gap: 20,
                      padding: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        columnGap: 10,
                        alignItems: 'center',
                      }}
                    >
                      {/* {userProfile?.name === userProfile?.phoneNumber ? (
                        <MaterialCommunityIcons
                          name="arrow-bottom-right-thin-circle-outline"
                          size={24}
                          color="black"
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="arrow-top-left-thin-circle-outline"
                          size={24}
                          color="red"
                        />
                      )} */}
                      {notificationIcon(e.type)}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={{ fontSize: 14, fontFamily: 'im' }}>
                          {e.title}
                        </Text>
                        {/* <Text>{formatTimestamp(e.createdAt)}</Text> */}
                      </View>
                    </View>
                    <View>
                      <Text
                        style={{
                          color: '#9095A1',
                          fontSize: 12,
                          fontFamily: 'ir',
                        }}
                      >
                        {e.content}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
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
