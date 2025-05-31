import {
  ActivityIndicator,
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
import React, { useState } from 'react';
import Button from '@/components/Button';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { imagePicker } from '@/utils/ImagePicker';
import {
  AntDesign,
  Feather,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '@/store/StoreContext';
import { uploadFile } from '@/api/user.service';
import { StatusBar } from 'expo-status-bar';
import { topBar } from '../../../cStyle';
import { ThemeColors } from '../../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataStore } from 'aws-amplify/datastore';

const Account = () => {
  const { signOut } = useAuthenticator();
  const {
    currentUser,
    setIsLoading,
    isLoading,
    userProfile,
    profilePicture,
    setProfilePicture,
  } = useGlobalContext();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { priBg, priText } = ThemeColors();

  const handleInviteFriends = () => {
    router.push('/(protected)/contact');
  };

  const handleProfilePicture = async () => {
    try {
      const file = await imagePicker();
      setIsLoading(true);
      if (!file) {
        throw new Error('No file selected');
      }
      setProfilePicture(file);
      setIsLoading(false);
      await uploadFile(file, userProfile?.userId);

      await AsyncStorage.setItem('profilePicture', file);
    } catch (error) {
      console.error('Error handling profile picture:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              {profilePicture || currentUser?.picture ? (
                <>
                  {loading && (
                    <ActivityIndicator
                      size="small"
                      color="#ffffff"
                      style={{ position: 'absolute' }}
                    />
                  )}
                  <Image
                    source={{ uri: profilePicture || currentUser.picture }}
                    style={{ width: '100%', height: '100%', borderRadius: 50 }}
                    resizeMode="cover"
                    onLoadEnd={() => setLoading(false)}
                    onError={() => setLoading(false)}
                  />
                </>
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
              // onPress={store}
            >
              {userProfile?.phone_number}
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: priBg, flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              padding: 20,
            }}
          >
            {menuItems.map((item, index) => {
              const isAuthorized =
                !item.authorizedUser ||
                item.authorizedUser.includes(userProfile.userId);
              if (isAuthorized) {
                return (
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
                      <Text style={[styles.itemText, { color: priText }]}>
                        {item.title}
                      </Text>
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
                                backgroundColor: userProfile?.is_nin_verified
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
                                {userProfile?.is_nin_verified
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
                                backgroundColor: userProfile?.is_bvn_verified
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
                                {userProfile?.is_bvn_verified
                                  ? 'Verified'
                                  : 'Not Verified'}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : null}
                      {item.extra && item.title === 'Contribution Invites' ? (
                        <View style={{ marginLeft: 5 }}>
                          <View
                            style={{
                              backgroundColor: 'red',
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
                              {userProfile?.invites?.length || 0}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color={priText}
                    />
                  </TouchableOpacity>
                );
              }

              return null;
            })}
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
            <Text style={{ fontSize: 25, color: 'black' }}>Log Out?</Text>
            <Text
              style={{
                fontSize: 16,
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
                onPress={async () => {
                  try {
                    setLoggingOut(true);
                    await signOut();
                    setTimeout(() => {
                      setLoggingOut(false);
                    }, 3000);
                  } catch (e) {
                    console.error('Error logging out:', e);
                    setLoggingOut(false);
                  }
                }}
                outline={false}
                loading={loggingOut}
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
    route: '/(protected)/personal_info',
  },
  {
    title: 'Verify Identity',
    icon: <MaterialIcons name="perm-identity" size={24} color="black" />,
    route: '/(protected)/smile_id',
    extra: true,
  },
  {
    title: 'Verify BVN',
    icon: <Ionicons name="document-text-outline" size={24} color="black" />,
    route: '/(protected)/bvn',
    extra: true,
  },
  {
    title: 'Cards management',
    icon: <AntDesign name="idcard" size={24} color="black" />,
    route: '/(protected)/cards',
  },
  {
    title: 'Contribution Invites',
    icon: <MaterialIcons name="insert-invitation" size={24} color="black" />,
    route: '/(protected)/my_invites',
    extra: true,
  },
  {
    title: 'Privacy & Security',
    icon: <MaterialIcons name="security" size={24} color="black" />,
    route: '/(protected)/privacy',
  },
  {
    title: 'Support',
    icon: <MaterialIcons name="support-agent" size={24} color="black" />,
    route: '/(protected)/support',
  },
  {
    title: 'Settings',
    icon: <AntDesign name="setting" size={24} color="black" />,
    route: '/(protected)/settings',
  },
  {
    authorizedUser: [
      '1831b390-4051-707e-e882-01ce028e7735',
      '089153d0-70d1-7084-dc69-f41032bfaefb',
    ],
    title: 'Admin',
    icon: <AntDesign name="home" size={24} color="black" />,
    route: '/(protected)/admin',
  },
];
