import {
  Platform,
  ScrollView,
  SafeAreaView,
  View,
  Text,
  Pressable,
} from 'react-native';
import Cards from '@/components/home/Cards';
import ProfileView from '@/components/home/ProfileView';
import Advert from '@/components/home/Advert';
import Options from '@/components/home/Options';
import { ThemedView } from '@/components/ThemedView';
import { useGlobalContext } from '@/store/StoreContext';
import { useEffect, useRef, useState } from 'react';
import {
  checkLinkExpiry,
  downloadUrl,
  fetchCurrUser,
  fetchUserProfile,
} from '@/api/user.service';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { getContacts } from '@/api/contact.service';
import { fetchUserContributions } from '@/api/contributions.service';
import { fetchUserNotification } from '@/api/notifications.service';
import { DataStore } from 'aws-amplify/datastore';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import {
  sendUserAttributeVerificationCode,
  updateUserAttributes,
} from 'aws-amplify/auth';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import { formatTimestamp } from '@/utils/formatTimestamp';
import { naira } from '@/constants/Currency';
import { fetchUserActivities } from '@/api/activities.service';
import {
  Contribution,
  UserActivity,
  UserNotifications,
  UserProfile,
} from '@/src/models';
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from '@/api/pushNotification.service';
import render from '@/components/Render';
import { fetchInviteContributions } from '@/api/invite.service';
import Hide from '@/components/Hide';
import { safeParseJSON } from '@/utils/safeJSON';
import { ThemeColors } from '@/constants/Colors';

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
    setProfilePicture,
    profilePicture,
    setInviteArray,
    hideValues,
    setParsed
  } = useGlobalContext();

  const {priBg, secBg, priText} = ThemeColors()

  useEffect(() => {
    fetchCurrUser(setCurrentUser);
  }, []);

  useEffect(() => {
    fetchUserProfile(setUserProfile, currentUser);
    const subscription = DataStore.observe(UserProfile).subscribe(() =>
      fetchUserProfile(setUserProfile, currentUser)
    );
    return () => subscription.unsubscribe();
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
    fetchUserContributions(currentUser?.userId, setContributions);
    const subscription = DataStore.observe(Contribution).subscribe(() =>
      fetchUserContributions(currentUser?.userId, setContributions)
    );
    return () => subscription.unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    fetchUserNotification(currentUser?.userId, setNotifications);
    const subscription = DataStore.observe(UserNotifications).subscribe(() =>
      fetchUserNotification(currentUser?.userId, setNotifications)
    );
    return () => subscription.unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const fetchActivities = async () => {
      await fetchUserActivities(userProfile?.userId, setUserActivities);
    };
    fetchActivities();

    const subscription = DataStore.observe(UserActivity).subscribe(() =>
      fetchActivities()
    );
    return () => subscription.unsubscribe();
  }, [userProfile]);

  useEffect(() => {
    const checkExpiry = async () => {
      const res = await checkLinkExpiry(currentUser?.picture);
      if (res) {
        console.log('link expired', res);
        const link = await downloadUrl(currentUser.userId);
        await updateUserAttributes({
          userAttributes: {
            picture: link || '',
          },
        });
        setProfilePicture(link);
        await fetchCurrUser(setCurrentUser);
      } else {
        console.log('link not expired');
        setProfilePicture(currentUser?.picture);
      }
    };

    if (currentUser?.picture) {
      checkExpiry();
    }
  }, [currentUser]);

  useEffect(() => {
    const registerPushToken = async () => {
      try {
        const pushToken = await registerForPushNotificationsAsync();

        if (pushToken && currentUser) {
          await savePushToken(currentUser, pushToken);
        }
      } catch (error) {
        console.log('Failed to get push token:', error);
      }
    };

    registerPushToken();
  }, [currentUser]);

  const responseListener = useRef();

  useEffect(() => {
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const inviteLink =
          response.notification.request.content.data.invite_link;
        if (inviteLink) {
          Linking.openURL(inviteLink);
        }
      });
    return () => {
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    const fetchContributions = async () => {
      const fetchedContributions = await fetchInviteContributions(
        userProfile?.invites
      );
      setInviteArray(fetchedContributions);
    };

    fetchContributions();
  }, [userProfile?.invites]);

  useEffect(() => {
    if (userProfile) {
      const parsedData = safeParseJSON(userProfile?.connections, []);
      setParsed(parsedData);
    }
  }, [userProfile]);

  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     const profile = await fetchUserProfile(setUserProfile, currentUser);

  //     if (!profile.phone_verified) {
  //       router.push('/protected/login_verify');
  //     }
  //   };
  //   if (currentUser) {
  //     fetchProfile();
  //   }
  // }, [currentUser]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: secBg }}>
      <StatusBar style="dark" />
      <ThemedView
        style={{
          flex: 1,
          paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
          backgroundColor: secBg,
        }}
      >
        <ProfileView
          name={userProfile?.name}
          picture={profilePicture || currentUser.picture}
          notifications={notifications}
          priText={priText}
        />
        <ScrollView contentContainerStyle={{}}>
          <Cards contributions={contributions} userProfile={userProfile} />
          <Options userProfile={userProfile} priText={priText}/>
          <Advert />
          <View
            style={{ paddingHorizontal: 20, backgroundColor: priBg, flex: 1 }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: 'esb', fontSize: 20, color: priText }}>
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
                backgroundColor: priBg,
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
                          {hideValues ? (
                            <Hide
                              color={
                                item.type === 'collection' ? 'green' : 'red'
                              }
                            />
                          ) : (
                            item.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          )}
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
