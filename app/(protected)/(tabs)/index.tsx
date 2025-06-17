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
} from 'react-native';
import Cards from '@/components/home/Cards';
import ProfileView from '@/components/home/ProfileView';
import Options from '@/components/home/Options';
import Advert from '@/components/home/Advert';
import { ThemedView } from '@/components/ThemedView';
import { useGlobalContext } from '@/store/StoreContext';
import { useCallback, useEffect, useState } from 'react';
import { fetchUserProfile, updateUserProfile } from '@/api/user.service';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import {
  fetchUserContributions,
  fetchUserInvitedContributions,
} from '@/api/contributions.service';
import { fetchUserNotification } from '@/api/notifications.service';
import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import { formatTimestamp } from '@/utils/formatTimestamp';
import { naira } from '@/constants/Currency';
import { fetchUserActivities } from '@/api/activities.service';
import { fetchInviteContributions } from '@/api/invite.service';
import Hide from '@/components/Hide';
import { Colors, ThemeColors } from '@/constants/Colors';
import UserVerificationModal from '@/components/modals/UserVerificationModal';
import Blog from '@/components/home/Blog';
import usePushNotifications from '@/hooks/usePushNotification';
import { getContacts } from '@/api/contact.service';
import useUserVerificationSteps from '@/hooks/useUserVerificationSteps';
import { listUserConnections } from '@/functions/connections';
import useDataStoreObservers from '@/hooks/useDatastoreObserver';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from 'react-native';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import {
  Contribution,
  ContributionParticipant,
  UserActivity,
  UserNotifications,
  UserProfile,
} from '@/src/models';
import { DataStore } from '@aws-amplify/datastore';
import { signOut } from 'aws-amplify/auth';
import { updateContributionOwners } from '@/scripts/populateAccessField';

export default function HomeScreen() {
  const {
    currentUser,
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
    profilePicture,
    setInviteArray,
    hideValues,
    parsed,
    setParsed,
    pilot,
    isReady,
    isLoading,
    inviteArray,
  } = useGlobalContext();

  const { priBg, priText } = ThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showUserVerificationModal, setShowUserVerificationModal] =
    useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [hasShownModal, setHasShownModal] = useState(false);

  const { user } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    if (!userProfile) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [userProfile]);

  useDataStoreObservers({
    currentUser: user,
    setContributions,
    setParsed,
    setInviteArray,
  });

  useUserVerificationSteps({
    currentUser: user,
    hasShownModal,
    setCompletedSteps,
    setShowUserVerificationModal,
    setHasShownModal,
  });

  // useUserProfile({
  //   currentUser,
  //   setUserProfile,
  //   setIsLoading,
  //   userProfile,
  // });

  usePushNotifications(user, userProfile);

  const fetchData = async (user: any) => {
    try {
      await Promise.all([
        fetchUserProfile(setUserProfile, user),
        fetchUserContributions(user?.userId, setContributions, 50),
        fetchUserNotification(user?.userId, setNotifications, 20),
        listUserConnections(user?.userId, setParsed),
        getContacts().then(setMyContacts),
        fetchUserActivities(user?.userId, setUserActivities, 20),
        fetchUserInvitedContributions(user.userId, setInviteArray, 20),
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  // Refresh control handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(user);
    setRefreshing(false);
  }, [fetchData]);

  // Initial data load
  useEffect(() => {
    fetchData(user);
  }, [isReady, user]);

  // const test = async () => {
  //   try {
  //     const activity = await DataStore.query(ContributionParticipant);
  //     // await updateContributionOwners();
  //     console.log(activity);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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
          picture={profilePicture || currentUser?.picture}
          notifications={notifications}
          priText={priText}
          setShowHelp={setShowHelp}
        />
        <ScrollView
          contentContainerStyle={{}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Cards contributions={contributions} />
          <Options
            priText={priText}
            setShowHelp={setShowHelp}
            connect={parsed?.length}
            pilot={pilot}
          />
          <Advert />
          {/* <Button title="SmileId" onPress={test} /> */}
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
                onPress={() => router.push('/activities')}
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
                    minHeight: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text>You do not have any activity yet</Text>
                </View>
              ) : (
                userActivities?.slice(0, 2)?.map((item: any, index: any) => {
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
                        {item.description?.includes('Failed') ? (
                          <MaterialIcons name="block" size={24} color="red" />
                        ) : item?.type === 'collection' ? (
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
                              color: item.description?.includes('Failed')
                                ? 'red'
                                : 'gray',
                            }}
                          >
                            {item.description?.includes('Failed')
                              ? 'Failed Contribution'
                              : capitalizeFirstLetter(item?.type)}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: 'ir',
                              color: 'gray',
                            }}
                          >
                            {item?.description}
                          </Text>
                        </View>
                        <View style={{ rowGap: 12 }}>
                          <Text
                            style={{
                              color:
                                item?.type === 'collection' ? 'green' : 'red',
                              fontSize: 16,
                              fontFamily: 'ir',
                            }}
                          >
                            {naira}
                            {hideValues ? (
                              <Hide
                                color={
                                  item?.type === 'collection' ? 'green' : 'red'
                                }
                              />
                            ) : (
                              item?.amount?.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            )}
                          </Text>
                          <Text style={{ fontSize: 10, color: 'gray' }}>
                            {formatTimestamp(item?.createdAt)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
          <View>
            <Blog />
          </View>
        </ScrollView>

        {/* <Modal
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
        </Modal> */}
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
                  route: `help/Account Help`,
                },
                {
                  label: 'Managing Group Contributions',
                  route: 'help/Group Contributions Help',
                },
                {
                  label: 'Managing Personal Contributions',
                  route: 'help/Personal Contributions Help',
                },
                {
                  label: 'Verifications',
                  route: 'help/Verification Help',
                },
                {
                  label: 'Troubleshooting',
                  route: 'help/Troubleshooting Help',
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
        <UserVerificationModal
          visible={showUserVerificationModal}
          onClose={() => setShowUserVerificationModal(false)}
          userName={userProfile?.name}
          completedSteps={completedSteps}
        />
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
