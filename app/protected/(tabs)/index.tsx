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

import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { notificationIcon } from '@/utils/notificationsIcon';
import { sendUserAttributeVerificationCode } from 'aws-amplify/auth';
import { isLoading } from 'expo-font';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import { formatTimestamp } from '@/utils/formatTimestamp';
import { naira } from '@/constants/Currency';
import { fetchUserActivities } from '@/api/activities.service';

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
    userActivities,
    setUserActivities,
  } = useGlobalContext();
  const [alertShown, setAlertShown] = useState(false);
  const getContributions = () => contributions;
  const getUserActivities = () => userActivities;

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
    fetchUserContributions(
      currentUser.userId,
      setContributions,
      getContributions
    );
  }, [currentUser]);

  useEffect(() => {
    fetchUserNotification(currentUser.userId, setNotifications);
  }, [currentUser]);

  useEffect(() => {
    (async () => {
      await fetchUserActivities(
        userProfile?.userId,
        setUserActivities,
        getUserActivities
      );
    })();
  }, [userProfile]);

  // useEffect(() => {
  //   if (!isLoading) {
  //     if (currentUser.phone_number_verified !== 'true' && !alertShown) {
  //       setAlertShown(true);
  //       Alert.alert(
  //         'Verification',
  //         'Please Verify your phone number',
  //         [
  //           {
  //             text: 'Verify Now',
  //             onPress: async () => {
  //               await sendUserAttributeVerificationCode({
  //                 userAttributeKey: 'phone_number',
  //               });
  //               router.push('/protected/device_verify');
  //             },
  //           },
  //         ],
  //         { cancelable: false }
  //       );
  //     }
  //   }
  // }, [currentUser, alertShown, isLoading]);

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
              {userActivities.map((item: any, index: any) => {
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
                        alignItems: 'start',
                      }}
                    >
                      {item.description.includes('Failed') ? (
                        <MaterialIcons name="block" size={24} color="red" />
                      ) : item.type === 'collection' ? (
                        <MaterialCommunityIcons
                          name="arrow-bottom-right-thin-circle-outline"
                          size={24}
                          color="green"
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="arrow-top-left-thin-circle-outline"
                          size={24}
                          color="red"
                        />
                      )}
                      <View
                        style={{
                          flex: 1,
                          rowGap: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'ir',
                            color: item.description.includes('Failed')
                              ? 'red'
                              : 'gray',
                          }}
                        >
                          {item.description.includes('Failed')
                            ? 'Failed Contribution'
                            : capitalizeFirstLetter(item.type)}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'ir',
                            color: 'gray',
                          }}
                        >
                          {item.description}
                        </Text>
                      </View>
                      <View style={{ rowGap: 12 }}>
                        <Text
                          style={{
                            color: item.type === 'collection' ? 'green' : 'red',
                            fontSize: 16,
                            fontFamily: 'ir',
                          }}
                        >
                          {naira}
                          {item.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                        <Text style={{ fontSize: 10, color: 'gray' }}>
                          {formatTimestamp(item.createdAt)}
                        </Text>
                      </View>
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
