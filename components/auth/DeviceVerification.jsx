import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, { useState } from 'react';
import Container from '../Container';
import { Colors } from '../../constants/Colors';
import {
  confirmUserAttribute,
  sendUserAttributeVerificationCode,
  signOut,
} from 'aws-amplify/auth';
import { useGlobalContext } from '@/store/StoreContext';
import { Link, router } from 'expo-router';
import * as Device from 'expo-device';
import { fetchCurrUser, updateUserProfile } from '../../api/user.service';
import { createNotification } from '../../api/notifications.service';
import { PhoneAuthProvider } from 'firebase/auth';

const DeviceVerification = () => {
  const {
    setIsLoading,
    setCurrentUser,
    currentUser,
    setNotifications,
    confirmationResult,
  } = useGlobalContext();
  const [code, setCode] = useState(0);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(confirmationResult, code);

      await fetchCurrUser(setCurrentUser);
      const device = {
        device_id: Device.osInternalBuildId || null,
        device_name: Device.deviceName || null,
        device_brand: Device.brand || null,
        phone_verified: true,
      };
      await updateUserProfile(device, currentUser);
      await createNotification(
        {
          title: 'Verification Completed',
          content: `Your phone number is verified and your device is registered`,
          type: 'verification',
          userId: currentUser.userId,
          read: false,
        },
        setNotifications
      );
      Alert.alert(
        'Success',
        `Your phone number is verified and your device is registered`,
        [
          {
            text: 'Continue',
            onPress: () => router.push('/protected'),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Error confirming signup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    router.push('/login_verify');
    // const res = await sendUserAttributeVerificationCode({
    //   userAttributeKey: 'phone_number',
    // });

    // console.log({ res });
  };

  return (
    <Container>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View
          style={{
            backgroundColor: 'white',
            paddingVertical: 50,
            borderRadius: 24,
            paddingHorizontal: 20,
          }}
        >
          <Text style={[styles.title, { marginBottom: 10 }]}>
            Verification Code
          </Text>
          <Text style={{ marginBottom: 40 }}>
            A code has been sent to your phone number
          </Text>
          <View>
            <Text style={styles.label}>Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter verification code"
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: 40,
            }}
          >
            <View
              style={{
                height: 48,
                flex: 1,
                borderRadius: 8,
                backgroundColor: 'red',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Pressable onPress={() => signOut()}>
                <Text style={styles.buttonText}>Later</Text>
              </Pressable>
            </View>
            <Pressable
              style={{
                height: 48,
                flex: 1,
                borderRadius: 8,
                backgroundColor: Colors.pri,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={handleVerify}
            >
              <Text style={styles.buttonText}>Verify</Text>
            </Pressable>
          </View>
          <Pressable
            style={{
              marginTop: 20,
              alignSelf: 'center',
            }}
            onPress={handleResend}
          >
            <Text>Resend Code</Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
};

export default DeviceVerification;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'esb',
  },
  input: {
    width: '100%',
    height: 51,
    padding: 10,
    borderWidth: 1,
    borderColor: '#9095A1',
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontFamily: 'isb',
    fontSize: 18,
    marginBottom: 5,
    color: '#424856',
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
  signUp: {
    color: '#007aff',
    fontWeight: 'bold',
  },
  termsText: {
    textAlign: 'center',
    color: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'esb',
  },
});
