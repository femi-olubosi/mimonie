import {
  Platform,
  ScrollView,
  SafeAreaView,
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Button,
} from 'react-native';
import Cards from '@/components/home/Cards';
import ProfileView from '@/components/home/ProfileView';
import Advert from '@/components/home/Advert';
import Options from '@/components/home/Options';
import { ThemedView } from '@/components/ThemedView';
import { useGlobalContext } from '@/store/StoreContext';
import { useEffect, useState } from 'react';
import {
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
import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import { formatTimestamp } from '@/utils/formatTimestamp';
import { naira } from '@/constants/Currency';
import { fetchUserActivities } from '@/api/activities.service';
import { Contribution, UserActivity, UserProfile } from '@/src/models';
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from '@/api/pushNotification.service';
import { fetchInviteContributions } from '@/api/invite.service';
import Hide from '@/components/Hide';
import { safeParseJSON } from '@/utils/safeJSON';
import { Colors, ThemeColors } from '@/constants/Colors';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchAndStoreProfilePicture,
  isExpired,
} from '@/utils/profileManagement';

export default function HomeScreen() {
  const {
    currentUser,
    setCurrentUser,
    setUserProfile,
    isLoading,
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
    parsed,
    setParsed,
    updateAvailable,
    setUpdateAvailable,
    pilot,
    setPilot,
  } = useGlobalContext();

  const { priBg, secBg, priText } = ThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCurrUser(setCurrentUser);
    await fetchUserProfile(setUserProfile, currentUser);
    await fetchUserContributions(currentUser?.userId, setContributions);
    await fetchUserNotification(currentUser?.userId, setNotifications);
    await fetchUserActivities(userProfile?.userId, setUserActivities);
    setRefreshing(false);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await fetchAuthSession({ forceRefresh: false });
        const tokenExpiry = session?.tokens?.accessToken?.payload?.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        if (!tokenExpiry || currentTime > tokenExpiry) {
          throw new Error('Token has expired');
        }
        console.log('Not yet');
      } catch (error) {
        console.log('yet');
        await signOut();
      }
    };
    checkAuthStatus();
  }, []);

  // useEffect(() => {
  //   fetchCurrUser(setCurrentUser);
  // }, []);

  useEffect(() => {
    // fetchUserProfile(setUserProfile, currentUser);
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
    // const subscription = DataStore.observe(UserNotifications).subscribe(() =>
    //   fetchUserNotification(currentUser?.userId, setNotifications)
    // );
    // return () => subscription.unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    fetchUserActivities(userProfile?.userId, setUserActivities);
    const subscription = DataStore.observe(UserActivity).subscribe(() =>
      fetchUserActivities(userProfile?.userId, setUserActivities)
    );
    return () => subscription.unsubscribe();
  }, [userProfile?.name]);

  // useEffect(() => {
  //   (async () => {
  //     // const file = await AsyncStorage.getItem('profilePicture');
  //     // if (!file) {
  //     const remotePicture = await downloadUrl(userProfile?.userId);
  //     if (remotePicture) {
  //       console.log('remote', remotePicture);
  //       setProfilePicture(remotePicture);
  //       await AsyncStorage.setItem('profilePicture', remotePicture);
  //     } else {
  //       console.log('Failed to download profile picture');
  //       setProfilePicture(null);
  //     }
  //     // } else {
  //     //   console.log('file', file);
  //     //   setProfilePicture(file);
  //     // }
  //   })();
  // }, [userProfile?.userId]);

  useEffect(() => {
    (async () => {
      if (!userProfile?.userId) return;

      try {
        const storedData = await AsyncStorage.getItem('profilePicture');
        if (storedData) {
          const res = safeParseJSON(storedData, {});

          if (isExpired(res?.timestamp)) {
            console.log('Profile picture URL expired. Fetching new one...');
            const picture = await fetchAndStoreProfilePicture(
              userProfile?.userId
            );
            setProfilePicture(picture);
          } else {
            console.log('Loaded profile picture from storage.');
            setProfilePicture(res?.url); // Use existing URL if not expired
          }
        } else {
          console.log('No profile picture in storage. Fetching new one...');
          const picture = await fetchAndStoreProfilePicture(
            userProfile?.userId
          );
          setProfilePicture(picture);
        }
      } catch (error) {
        console.error('Error managing profile picture:', error);
      }
    })();
  }, [userProfile?.userId]);

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

    if (userProfile) {
      registerPushToken();
    }
  }, [currentUser, userProfile]);

  // const responseListener = useRef();

  // useEffect(() => {
  //   responseListener.current =
  //     Notifications.addNotificationResponseReceivedListener((response) => {
  //       const inviteLink =
  //         response.notification.request.content.data.invite_link;
  //       if (inviteLink) {
  //         Linking.openURL(inviteLink);
  //       }
  //     });
  //   return () => {
  //     responseListener.current &&
  //       Notifications.removeNotificationSubscription(responseListener.current);
  //   };
  // }, []);

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

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setUpdateAvailable(true);
        }
      } catch (error) {
        console.error('Error checking for updates: ', error);
      }
    };

    if (!__DEV__) {
      checkForUpdates();
    }
  }, []);

  const triggerAppUpdate = async () => {
    try {
      setUpdateAvailable(false);
      setIsLoading(true);
      const update = await Updates.fetchUpdateAsync();
      if (update.isNew) {
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error('Error fetching update: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      <StatusBar style="dark" />
      <ThemedView
        style={{
          flex: 1,
          paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
          backgroundColor: '#F0F9FF',
        }}
      >
        <ProfileView
          name={userProfile?.name}
          picture={profilePicture}
          notifications={notifications}
          priText={priText}
          setShowHelp={setShowHelp}
        />
        <ScrollView
          contentContainerStyle={{}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          // ref={scrollViewRef}
        >
          <Cards contributions={contributions} />
          <Options
            userProfile={userProfile}
            priText={priText}
            setShowHelp={setShowHelp}
            connect={parsed?.length}
            pilot={pilot}
          />
          {/* <Advert /> */}
          {/* <Button
            title="SmileId"
            onPress={() => router.push('/protected/complete_profile')}
          /> */}
          <View
            style={{
              paddingHorizontal: 20,
              backgroundColor: priBg,
              flex: 1,
              paddingTop: 30,
            }}
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
              {userActivities?.length < 1 ? (
                <View
                  style={{
                    rowGap: 6,
                    width: '100%',
                    minHeight: 400,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text>You do not have any activity yet</Text>
                </View>
              ) : (
                userActivities.slice(0, 10).map((item: any, index: any) => {
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
                              color:
                                item.type === 'collection' ? 'green' : 'red',
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
                })
              )}
            </View>
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={updateAvailable}
          onRequestClose={() => {
            setUpdateAvailable(false);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Update Is Available!</Text>
              <Text style={{ marginHorizontal: 10 }}>
                A new version of the app is available. Please download it now to
                continue using the app.
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  columnGap: 40,
                  marginTop: 40,
                }}
              >
                <Pressable
                  style={[styles.button, styles.buttonUpdate]}
                  onPress={triggerAppUpdate}
                >
                  <Text style={styles.textStyle}>Update</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showHelp}
          onRequestClose={() => {
            setShowHelp(false);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView1}>
              <Text style={styles.modalTitle}>Need Help?</Text>

              {[
                {
                  label: 'Account Setup',
                  route: `/protected/help/Account Help`,
                },
                {
                  label: 'Managing Group Contributions',
                  route: '/protected/help/Group Contributions Help',
                },
                {
                  label: 'Managing Personal Contributions',
                  route: '/protected/help/Personal Contributions Help',
                },
                {
                  label: 'Verifications',
                  route: '/protected/help/Verification Help',
                },
                {
                  label: 'Troubleshooting',
                  route: '/protected/help/Troubleshooting Help',
                },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.helpButton}
                  onPress={() => {
                    setShowHelp(false);
                    router.push(item.route);
                  }}
                >
                  <Text style={styles.modalText1}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity onPress={() => setShowHelp(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 8,
    elevation: 2,
    width: '90%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: 'red',
  },

  buttonUpdate: {
    backgroundColor: Colors.pri,
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'isb',
    fontSize: 26,
  },
  modalText1: {
    color: 'white',
    fontSize: 16,
  },
  closeText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
  },
  helpButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.pri,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  modalView1: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
