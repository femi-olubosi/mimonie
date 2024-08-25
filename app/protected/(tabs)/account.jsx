import {
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Button from '../../../components/Button';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { imagePicker } from '@/utils/ImagePicker';
import {
  AntDesign,
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useFocusEffect, useRouter } from 'expo-router';
import { useGlobalContext } from '@/store/StoreContext';
import { uploadFile } from '@/api/user.service';
import { updateUserAttributes } from 'aws-amplify/auth';
import {
  fetchCurrUser,
  fetchUserProfile,
  updateUserProfile,
} from '../../../api/user.service';
import { StatusBar } from 'expo-status-bar';
import { topBar } from '../../../cStyle';
import { get } from 'aws-amplify/api';
import { searchTree } from '../../../utils/searchTree';
import { createNotification } from '@/api/notifications.service';
import {
  isNameAndDobIncluded,
  isNameIncluded,
} from '../../../utils/isNameIncluded';
import {
  createSubAccount,
  getPaystackCustomer,
} from '../../../api/payment.service';

const Account = () => {
  const { signOut } = useAuthenticator();
  const {
    currentUser,
    setCurrentUser,
    setIsLoading,
    userProfile,
    setUserProfile,
    setNotifications,
    myContacts,
  } = useGlobalContext();
  const [profilePicture, setProfilePicture] = useState('');
  const [logoutModal, setLogoutModal] = useState(false);
  const router = useRouter();

  const handleInviteFriends = () => {
    router.push('/protected/contact');
  };

  const handleProfilePicture = async () => {
    try {
      const file = await imagePicker();
      if (!file) {
        throw new Error('No file selected');
      }

      setProfilePicture(file);
      setIsLoading(true);
      const fileText = await uploadFile(file, 'profile');
      if (!fileText) {
        throw new Error('Failed to upload file');
      }
      await updateUserAttributes({
        userAttributes: {
          picture: fileText,
        },
      });

      await updateUserProfile({ picture: fileText }, currentUser);
      await fetchCurrUser(setCurrentUser);
    } catch (error) {
      console.error('Error handling profile picture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      async function getSmileStatus() {
        try {
          const restOperation = get({
            apiName: 'callback',
            path: '/smileid-callback',
          });

          const { body } = await restOperation.response;
          const json = await body.json();
          console.log({ json });
          const res = await searchTree(json, 'FullName');
          if (
            isNameAndDobIncluded(res, userProfile.name, userProfile.birthdate)
          ) {
            await updateUserProfile(
              { is_nin_verified: true, verification_in_progress_id: false },
              currentUser
            );

            await createNotification(
              {
                title: 'Verification Completed',
                content: `You have successfully verified your identity`,
                type: 'verification',
                userId: currentUser.userId,
                read: false,
              },
              setNotifications
            );
          }
          await fetchUserProfile(setUserProfile, currentUser);
        } catch (e) {
          console.log('GET call failed: ', JSON.parse(e.response.body));
        }
      }
      const fetchCustomer = async () => {
        const res = await getPaystackCustomer(userProfile.customer_code);

        // if (res.data.identified) {
        if (true) {
          const subacc = await createSubAccount(userProfile);

          await updateUserProfile(
            {
              is_bvn_verified: true,
              verification_in_progress: false,
              subaccount_code: subacc.data.subaccount_code,
            },
            currentUser
          );
          await fetchUserProfile(setUserProfile, currentUser);
          await createNotification(
            {
              title: 'Verification Completed',
              content: `Your BVN verification is complete and approved`,
              type: 'verification',
              userId: currentUser.userId,
              read: false,
            },
            setNotifications
          );
        }
      };
      if (!userProfile.is_nin_verified) {
        getSmileStatus();
      }
      // if (!userProfile.is_bvn_verified) {
      if (userProfile.verification_in_progress) {
        fetchCustomer();
      }
    }, [
      userProfile.is_bvn_verified,
      userProfile.is_nin_verified,
      userProfile.subaccount_code,
    ])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1, justifyContent: 'center', paddingTop: topBar }}>
        <View style={{ backgroundColor: '#F0F9FF', height: 230 }}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <View
              style={{
                height: 100,
                width: 100,
                borderRadius: 100,
                backgroundColor: '#ED7D2D',
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: 20,
                alignSelf: 'center',
                position: 'relative',
              }}
            >
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  style={{ width: '100%', height: '100%', borderRadius: 50 }}
                  resizeMode="cover"
                />
              ) : currentUser?.picture ? (
                <Image
                  source={{ uri: currentUser.picture }}
                  style={{ width: '100%', height: '100%', borderRadius: 50 }}
                  resizeMode="cover"
                />
              ) : (
                <FontAwesome name="user-o" size={34} color="white" />
              )}
              <Pressable
                style={{
                  position: 'absolute',
                  right: 6,
                  bottom: 4,
                  backgroundColor: Colors.pri,
                  padding: 3,
                  borderRadius: 4,
                }}
                onPress={handleProfilePicture}
              >
                <Feather name="camera" size={16} color="white" />
              </Pressable>
            </View>
            <Text style={{ color: '#424856', fontSize: 18, fontFamily: 'er' }}>
              {userProfile?.name}
            </Text>
            <Text
              style={{
                color: '#424856',
                fontSize: 14,
                fontFamily: 'ir',
                marginTop: 10,
              }}
            >
              {userProfile?.phone_number}
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: 'white', flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              padding: 20,
            }}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.itemContainer}
                onPress={() => router.push(item.route)}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {item.icon}
                  <Text style={styles.itemText}>{item.title}</Text>
                  {item.extra && item.title === 'Verify Identity' ? (
                    <View style={{ marginLeft: 5 }}>
                      {userProfile?.verification_in_progress_id ? (
                        <View
                          style={{
                            backgroundColor: '#ecb753',
                            paddingHorizontal: 4,
                            paddingVertical: 2,
                            borderRadius: 5,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: 'black',
                            }}
                          >
                            Pending
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={{
                            backgroundColor: userProfile.is_nin_verified
                              ? 'green'
                              : 'red',
                            paddingHorizontal: 4,
                            paddingVertical: 2,
                            borderRadius: 5,
                            marginLeft: 5,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: 'white',
                            }}
                          >
                            {userProfile.is_nin_verified
                              ? 'Verified'
                              : 'Not Verified'}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : null}
                  {item.extra && item.title === 'Verify BVN' ? (
                    <View style={{ marginLeft: 5 }}>
                      {userProfile?.verification_in_progress ? (
                        <View
                          style={{
                            backgroundColor: '#ecb753',
                            paddingHorizontal: 4,
                            paddingVertical: 2,
                            borderRadius: 5,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: 'black',
                            }}
                          >
                            Pending
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={{
                            backgroundColor: userProfile.is_bvn_verified
                              ? 'green'
                              : 'red',
                            paddingHorizontal: 4,
                            paddingVertical: 2,
                            borderRadius: 5,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: 'white',
                            }}
                          >
                            {userProfile.is_bvn_verified
                              ? 'Verified'
                              : 'Not Verified'}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={24} color="black" />
              </TouchableOpacity>
            ))}
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                marginTop: 30,
              }}
            >
              <Button
                title={'Invite Friends'}
                color={Colors.pri}
                onPress={handleInviteFriends}
                outline={true}
              />
              <Button
                title={'Log Out'}
                color={'red'}
                onPress={() => setLogoutModal(true)}
                outline={false}
              />
            </View>
          </ScrollView>
        </View>
      </View>
      <Modal visible={logoutModal} animationType="slide" transparent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
              backgroundColor: 'black',
              opacity: 0.5,
            }}
          ></View>
          <View
            style={{
              backgroundColor: 'white',
              paddingHorizontal: 16,
              width: '99%',
              paddingVertical: 55,
              justifyContent: 'flex-end',
              alignItems: 'center',
              rowGap: 20,
              shadowColor: 'gray',
              shadowOpacity: 0.2,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            {/* <AntDesign name="logout" size={80} style={{ color: 'red' }} /> */}
            <Text style={{ fontSize: 25, color: 'black' }}>Log Out?</Text>
            <Text
              style={{
                fontSize: 16,
                // fontFamily: font.l,
                color: 'gray',
                textAlign: 'center',
              }}
            >
              This account will be logged out. Are you sure you want to do this?
            </Text>
            <View style={{ width: '100%' }}>
              <Button
                title={'Confirm Log Out'}
                color={'red'}
                onPress={() => {
                  // setLogoutModal(false);
                  signOut();
                }}
                outline={false}
                styleOverride={{ width: '100%' }}
              />
              <Button
                color={'gray'}
                title={'Cancel'}
                onPress={() => setLogoutModal(false)}
                outline={true}
                styleOverride={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  itemText: {
    marginLeft: 16,
    fontSize: 16,
    fontFamily: 'ir',
  },
});

const menuItems = [
  {
    title: 'Personal Information',
    icon: <Ionicons name="person-outline" size={24} color="black" />,
    route: '/protected/personal_info',
  },
  {
    title: 'Verify Identity',
    icon: <MaterialIcons name="perm-identity" size={24} color="black" />,
    route: '/protected/kyc',
    extra: true,
  },
  {
    title: 'Verify BVN',
    icon: <Ionicons name="document-text-outline" size={24} color="black" />,
    route: '/protected/bvn',
    extra: true,
  },
  {
    title: 'Cards management',
    icon: <AntDesign name="idcard" size={24} color="black" />,
    route: '/protected/cards',
  },
  // {
  //   title: 'Contributions Invites',
  //   icon: <MaterialIcons name="insert-invitation" size={24} color="black" />,
  //   route: '/invites',
  // },
  {
    title: 'Privacy & Security',
    icon: <MaterialIcons name="security" size={24} color="black" />,
    route: '/privacy_security',
  },
  {
    title: 'Support',
    icon: <MaterialIcons name="support-agent" size={24} color="black" />,
    route: '/support',
  },
];
