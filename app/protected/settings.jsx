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
import * as Updates from 'expo-updates'; // Import Updates from Expo
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from '@/api/pushNotification.service';

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

const Settings = () => {
  const { currentUser, userProfile } = useGlobalContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [externalProfileViewEnabled, setExternalProfileViewEnabled] =
    useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for app updates
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setUpdateAvailable(true); // Set update available flag
        }
      } catch (error) {
        console.error('Error checking for updates: ', error);
      }
    };

    checkForUpdates();
  }, []);

  // Toggle functions
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

  const toggleDarkMode = () => setDarkModeEnabled(!darkModeEnabled);
  const toggleExternalProfileView = () =>
    setExternalProfileViewEnabled(!externalProfileViewEnabled);

  // Handle app update when user clicks the Update App button
  const triggerAppUpdate = async () => {
    try {
      setIsLoading(true); // Show loader during update
      const update = await Updates.fetchUpdateAsync();
      if (update.isNew) {
        await Updates.reloadAsync(); // Reload the app with the new update
      }
    } catch (error) {
      console.error('Error fetching update: ', error);
    } finally {
      setIsLoading(false); // Hide loader after update process
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
            value={darkModeEnabled}
            disabled
          />
        </View>

        {/* Allow External Profile View */}
        <View style={styles.setting}>
          <Text style={styles.settingText}>
            Allow External View of Profile Picture
          </Text>
          <Switch
            onValueChange={toggleExternalProfileView}
            value={externalProfileViewEnabled}
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
              <Text style={styles.updateAvailable}> - Update Available</Text>
            )}
          </Text>
          {isLoading && <ActivityIndicator size="small" color="#007aff" />}
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.setting}
          onPress={triggerAccountDeletion}
        >
          <Text style={[styles.settingText, { color: 'red' }]}>
            Delete Account
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
    color: 'green',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
