import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PageView } from '../../components/Reusable';
import { useGlobalContext } from '../../store/StoreContext';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { fetchUserProfile, updateUserProfile } from '../../api/user.service';
import { createNotification } from '../../api/notifications.service';
import Button from '../../components/Button';
import { Colors } from '../../constants/Colors';

const kyc = () => {
  const {
    userProfile,
    setIsLoading,
    setNotifications,
    setUserProfile,
    currentUser,
  } = useGlobalContext();
  const [btnActive, setBtnActive] = useState(false);

  useEffect(() => {
    if (userProfile.is_nin_verified) {
      setIsLoading(false);
      Alert.alert(
        'Verification',
        'This user is already verified',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
        { cancelable: false }
      );
    }
  }, []);

  const handleFinish = async () => {
    await updateUserProfile(
      {
        verification_in_progress_id: true,
      },
      currentUser
    );
    await fetchUserProfile(setUserProfile, currentUser);
    await createNotification(
      {
        title: 'Verification In Progress',
        content: `You have successfully processed your Identity verification. You will be notified when the verification is complete`,
        type: 'alert',
        userId: currentUser.userId,
        read: false,
      },
      setNotifications
    );
    router.push('/(protected)/account');
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBtnActive(true);
    }, 360000);

    return () => clearTimeout(timeout);
  }, []);

  const liveLink =
    'https://links.usesmileid.com/6982/98601622-72ef-4511-a1b5-c7fe520c0c27';
  const sandboxLink =
    'https://links.sandbox.usesmileid.com/6982/955ebd44-e1b2-41a1-8f9d-804a7be4cdc0';

  return (
    <PageView title={'Verification'} route={'/(protected)/account'}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {!userProfile.is_nin_verified ? (
            <WebView
              source={{
                uri: liveLink,
              }}
              style={styles.webview}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                Alert.alert('WebView error: ', nativeEvent.description);
              }}
            />
          ) : null}
        </ScrollView>
        {btnActive ? (
          <View style={{ padding: 20 }}>
            <Button
              title={'Upload Completed'}
              color={Colors.pri}
              onPress={handleFinish}
              disabled={!btnActive}
            />
            <Text style={{ fontSize: 12, textAlign: 'center' }}>
              Click only if you have completed the upload process
            </Text>
          </View>
        ) : null}
      </View>
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    rowGap: 20,
  },
  webview: {
    minHeight: Dimensions.get('window').height,
  },
});

export default kyc;
