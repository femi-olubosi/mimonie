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
import { confirmUserAttribute } from 'aws-amplify/auth';
import { useGlobalContext } from '@/store/StoreContext';
import { Link, router } from 'expo-router';
import * as Device from 'expo-device';
import { fetchCurrUser } from '../../api/user.service';
import { createNotification } from '../../api/notifications.service';

const DeviceVerification = () => {
  const { setIsLoading, setCurrentUser, currentUser, setNotifications } =
    useGlobalContext();
  const [code, setCode] = useState(0);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      await confirmUserAttribute({
        userAttributeKey: 'phone_number',
        confirmationCode: code,
      });

      await fetchCurrUser(setCurrentUser);
      await createNotification(
        {
          title: 'Phone Verification Completed',
          content: `Thank you for verifying your phone number`,
          type: 'verification',
          userId: currentUser.userId,
          read: false,
        },
        setNotifications
      );
      Alert.alert(
        'Success',
        `Your phone number has been verified successfully.`,
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
          <Text style={[styles.title, { marginBottom: 40 }]}>
            Verification Code
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
              <Link href={'/protected'}>
                <Text style={styles.buttonText}>Later</Text>
              </Link>
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
          {/* <Pressable
            style={{
              marginTop: 20,
              alignSelf: 'center',
            }}
            onPress={handleResend}
          >
            <Text>Resend Code</Text>
          </Pressable> */}
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
