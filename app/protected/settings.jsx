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
import { createDedicatedVirtualAccount } from '@/api/payment.service';
import { fetchUserProfile, updateUserProfile } from '../../api/user.service';
import { router } from 'expo-router';
import {
  chargeAndTransferToDva,
  createTransferRecipientForBank,
  createTransferRecipientForDVA,
  fetchTransferRecipients,
} from '../../api/payment.service';

const triggerAccountDeletion = () => {
  Alert.alert(
    'Delete Account',
    'Are you sure you want to delete your account? This action cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          console.log('Account deletion triggered');
          // Add your delete account logic here
        },
        style: 'destructive',
      },
    ],
    { cancelable: true }
  );
};

const data = {
  bank: {
    name: 'Wema Bank',
    id: 20,
    slug: 'wema-bank',
  },
  account_name: 'MOUNTSPIRALNI/ABDURROHEEM SHERIFDEEN',
  account_number: '9320275000',
  assigned: true,
  currency: 'NGN',
  metadata: null,
  active: true,
  id: 24222125,
  created_at: '2024-08-06T12:08:15.000Z',
  updated_at: '2024-09-15T20:25:08.000Z',
  assignment: {
    integration: 1216711,
    assignee_id: 172124958,
    assignee_type: 'Customer',
    expired: false,
    account_type: 'PAY-WITH-TRANSFER-RECURRING',
    assigned_at: '2024-09-15T20:25:08.850Z',
    expired_at: null,
    assignment_expires_at: null,
  },
  customer: {
    id: 172124958,
    first_name: 'Sherif-deen',
    last_name: 'Abdur-roheem',
    email: 'abdurroheemsherifdeen@gmail.com',
    customer_code: 'CUS_c2lbp8636b1qowo',
    phone: '+2348139781147',
    metadata: {},
    risk_action: 'default',
    international_format_phone: '+2348139781147',
  },
};
const Settings = () => {
  const {
    currentUser,
    userProfile,
    setUserProfile,
    hideValues,
    setHideValues,
    setIsLoading,
    setDarkMode,
    darkMode
  } = useGlobalContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pCEnable, setPCEnable] = useState(false);

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

    checkForUpdates();
  }, []);

  const toggleNotifications = async () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
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
      setIsLoading(false);
    }
  };

  const handleEnablePersonalContribution = async () => {
    setIsLoading(true);

    if (pCEnable) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: response } = await createDedicatedVirtualAccount(
        userProfile.customer_code
      );

      const customerRecipientCode = await createTransferRecipientForBank(
        userProfile
      );

      const dvaRecipientCode = await createTransferRecipientForDVA(response);

      const toStore = {
        account_number: response.account_number,
        account_name: response.account_name,
        bank_name: response.bank.name,
        bank_slug: response.bank.slug,
        bank_id: response.bank.id,
        account_type: response.assignment.account_type,
        dva_recipient_code: dvaRecipientCode,
        customer_recipient_code: customerRecipientCode,
        enabled: true,
      };

      await updateUserProfile({ dva: toStore }, currentUser);
      await fetchUserProfile(setUserProfile, currentUser);
      setPCEnable(true);
      setIsLoading(false);

      Alert.alert(
        'Success',
        'Personal contribution enabled successfully!',
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
          {
            text: 'Create Contribution',
            onPress: () => router.push('/protected/create_contribution'),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error creating personal contribution:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const payment = async () => {
    setIsLoading(true);
    try {
      const res = await chargeAndTransferToDva(
        { email: userProfile.email, auth_url: userProfile.auth_url },
        userProfile.dva.dva_recipient_code,
        50
      );
      console.log('outer respons', res);
    } catch (error) {
      console.log('error respons', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageView title={'Settings'}>
      <View style={{ padding: 20 }}>
        {/* Push Notifications Toggle */}
        <View style={styles.setting}>
          <Text style={styles.settingText}>Enable Push Notifications</Text>
          <Switch
            onValueChange={toggleNotifications}
            value={!!userProfile?.push_token}
            disabled={!!userProfile?.push_token}
          />
        </View>

        {/* Dark Mode Toggle */}
        <View style={styles.setting}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch
            onValueChange={toggleDarkMode}
            value={darkMode}
            disabled
          />
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
        <View style={styles.setting}>
          <View>
            <Text style={styles.settingText}>Enable Personal Contribution</Text>
            <Text style={{ fontSize: 10, fontFamily: 'ir' }}>
              You will not be able to disable it again until after 3 months
            </Text>
          </View>
          <Switch
            onValueChange={handleEnablePersonalContribution}
            value={userProfile?.dva?.enabled || pCEnable}
            // disabled={userProfile?.dva?.enabled || pCEnable}
            disabled
          />
        </View>

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
          // onPress={triggerAccountDeletion}
          onPress={payment}
        >
          <Text style={[styles.settingText, { color: 'red' }]}>
            Request Account Deletion
          </Text>
        </TouchableOpacity>
      </View>
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
