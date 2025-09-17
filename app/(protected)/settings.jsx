import React, { useState, useEffect } from 'react';
import {
  View,
  Switch,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { PageView } from '@/components/Reusable';
import { useGlobalContext } from '@/store/StoreContext';
import * as Updates from 'expo-updates';
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from '@/api/pushNotification.service';
import {
  deleteUserProfile,
  fetchUserProfile,
  updateUserProfile,
} from '../../api/user.service';
import { router } from 'expo-router';
import { createTransferRecipientForBank } from '../../api/payment.service';
import { createRequest } from '../../api/request.service';
import DeleteRequestModal from '../../components/modals/DeleteRequestModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGetPushTokenFromLocalStorage } from '../../hooks/useGetPushToken';
import { reRegisterForPushNotificationsAsync } from '../../api/pushNotification.service';
import { hasActiveContribution } from '../../utils/validateUserContributions';
import { deleteUser, signOut } from 'aws-amplify/auth';
import { DataStore } from 'aws-amplify/datastore';

const Settings = () => {
  const {
    currentUser,
    userProfile,
    setUserProfile,
    hideValues,
    setHideValues,
    setIsLoading,
    setDarkMode,
    darkMode,
    updateAvailable,
    setUpdateAvailable,
    contributions,
    noAuth,
  } = useGlobalContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pCEnable, setPCEnable] = useState(false);
  const [deleteRequestModal, setDeleteRequestModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [requested, setRequested] = useState(false);

  const pushToken = useGetPushTokenFromLocalStorage();

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

  const toggleNotifications = async (enabled) => {
    setNotificationsEnabled(!false);
    if (enabled) {
      const pushToken = await reRegisterForPushNotificationsAsync();
      if (pushToken) {
        setNotificationsEnabled(true);
        await savePushToken(currentUser, pushToken);
        await AsyncStorage.setItem('pushToken', JSON.stringify(pushToken));
        Alert.alert(
          'Notifications Enabled',
          'You will now receive push notifications.'
        );
      } else {
        setNotificationsEnabled(false);
        Alert.alert(
          'Error',
          'Failed to register for push notifications. Please try again later.'
        );
      }
    } else {
      setNotificationsEnabled(false);
      await savePushToken(currentUser, null);
      await AsyncStorage.removeItem('pushToken');
      Alert.alert(
        'Notifications Disabled',
        'You will no longer receive push notifications.'
      );
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const triggerAppUpdate = async () => {
    try {
      setLoading(true);
      const update = await Updates.fetchUpdateAsync();
      if (update.isNew) {
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error('Error fetching update: ', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleEnablePersonalContribution = async () => {
  //   setIsLoading(true);

  //   if (pCEnable) {
  //     setIsLoading(false);
  //     return;
  //   }

  //   try {
  //     const customerRecipientCode = await createTransferRecipientForBank({
  //       bank_code: userProfile.bank_details.bank_code,
  //       account_number: userProfile.bank_details.account_number,
  //       account_name: userProfile.name,
  //     });

  //     const toStore = {
  //       customer_recipient_code: customerRecipientCode,
  //       enabled: true,
  //     };

  //     await updateUserProfile(
  //       { dva: toStore, recipient_code: customerRecipientCode },
  //       currentUser,
  //       userProfile
  //     );
  //     await fetchUserProfile(setUserProfile, currentUser);
  //     setPCEnable(true);
  //     setIsLoading(false);

  //     Alert.alert(
  //       'Success',
  //       'Personal contribution enabled successfully!',
  //       [
  //         { text: 'OK', onPress: () => console.log('OK Pressed') },
  //         {
  //           text: 'Create Contribution',
  //           onPress: () => router.push('/(protected)/create_contribution'),
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } catch (error) {
  //     console.error('Error creating personal contribution:', error);
  //     setIsLoading(false);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   const getRequestStatus = async () => {
  //     const request = await AsyncStorage.getItem('requested');
  //     setRequested(!!request);
  //   };

  //   getRequestStatus();
  // }, [deleting]);

  const onDelete = async (reason) => {
    if (hasActiveContribution(contributions)) {
      Alert.alert(
        'Error',
        'You can not delete your account when you have a contribution still running'
      );
      return;
    }

    const data = {
      type: 'delete_request',
      username: userProfile.username,
      userId: userProfile.userId,
      user_email: userProfile.email,
      status: 'closed',
      reason,
    };
    setDeleting(true);
    try {
      await createRequest(data);
      await deleteUserProfile(userProfile);
      await DataStore.clear();
      await deleteUser();
      await AsyncStorage.removeItem('local_details');
      setDeleteRequestModal(false);
      noAuth();
      signOut();
    } catch (e) {
      console.error('Error sending delete request:', e);
      Alert.alert('Error', 'Failed to send delete request');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageView title={'Settings'}>
      <View style={{ padding: 20 }}>
        {/* Push Notifications Toggle */}
        <View style={styles.setting}>
          <Text style={styles.settingText}>Enable Push Notifications</Text>
          <Switch
            onValueChange={(e) => toggleNotifications(e)}
            value={notificationsEnabled || !!pushToken}
            disabled={!!pushToken}
          />
        </View>

        {/* Dark Mode Toggle */}
        <View style={styles.setting}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch onValueChange={toggleDarkMode} value={darkMode} disabled />
        </View>

        {/* Hide Contribution Values */}
        <View style={styles.setting}>
          <Text style={styles.settingText}>Hide Contribution Values</Text>
          <Switch
            onValueChange={() => setHideValues(!hideValues)}
            value={hideValues}
          />
        </View>
        {/* Enable personal contribution */}
        {/* <View style={styles.setting}>
          <View>
            <Text style={styles.settingText}>Enable Personal Contribution</Text>
          </View>
          <Switch
            onValueChange={handleEnablePersonalContribution}
            value={userProfile?.dva?.enabled || pCEnable}
            disabled={userProfile?.dva?.enabled || pCEnable}
          />
        </View> */}

        {/* Update App - Show an indicator if update is available */}
        <TouchableOpacity
          style={styles.setting}
          onPress={triggerAppUpdate}
          disabled={!updateAvailable}
        >
          <Text style={styles.settingText}>
            Update App{' '}
            {updateAvailable && (
              <View style={styles.update}>
                <Text style={styles.updateAvailable}> Update</Text>
              </View>
            )}
          </Text>
          {loading && <ActivityIndicator size="small" color="#007aff" />}
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.setting}
          onPress={() => setDeleteRequestModal(true)}
        >
          <Text
            style={[styles.settingText, { color: requested ? 'gray' : 'red' }]}
          >
            Delete My Account
          </Text>
          {requested && (
            <Text style={{ color: 'gray', fontSize: 10 }}>Request Pending</Text>
          )}
        </TouchableOpacity>
      </View>
      <DeleteRequestModal
        visible={deleteRequestModal}
        onClose={() => setDeleteRequestModal(false)}
        onDelete={onDelete}
        deleting={deleting}
      />
    </PageView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingText: {
    fontSize: 16,
  },
  updateAvailable: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'ir',
  },
  update: {
    backgroundColor: 'red',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
