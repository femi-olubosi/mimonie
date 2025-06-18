import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Container from '../Container';
import { Colors } from '../../constants/Colors';
import {
  autoSignIn,
  confirmSignUp,
  resendSignUpCode,
  signOut,
} from 'aws-amplify/auth';
import { useGlobalContext } from '@/store/StoreContext';
import { router, useLocalSearchParams } from 'expo-router';
import { ModalComp } from '../ModalComp';
import CompleteProfile from '../CompleteProfile';
import { createUserProfile } from '../../api/user.service';
import * as Device from 'expo-device';

const EmailConfirmation = () => {
  const { emailVeri, setIsLoading, currentUser, noAuth } = useGlobalContext();
  const { email, userId, normalizedPhoneNumber } = useLocalSearchParams();
  const [code, setCode] = useState(0);
  const [showCompleteProfileModal, setShowCompleteProfileModal] =
    useState(false);

  useEffect(() => {
    if (currentUser && currentUser.email_verified) {
      setShowCompleteProfileModal(true);
    }
  }, [currentUser]);

  const handleVerify = async () => {
    const device = {
      device_id: Device.osInternalBuildId || null,
      device_name: Device.deviceName || null,
      device_brand: Device.brand || null,
    };

    setIsLoading(true);
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: emailVeri,
        confirmationCode: code,
      });

      if (isSignUpComplete) {
        const signInOutput = await autoSignIn();
        if (signInOutput) {
          await createUserProfile(userId, device, email, normalizedPhoneNumber);
          router.replace('/(protected)/complete_profile');
        } else {
          Alert.alert(
            'Sign-in failed',
            'Unable to sign in automatically. Please try manually.'
          );
        }
      } else {
        Alert.alert(
          'Warning',
          'Your email verification is not complete. Please try again.'
        );
      }
    } catch (error) {
      Alert.alert('Error', error?.message);
      console.error('Error confirming signup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await resendSignUpCode({ username: emailVeri });
      alert('Code resent successful');
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLater = async () => {
    noAuth();
    signOut();
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
          <Text style={{ marginBottom: 40, textAlign: 'center' }}>
            Check your email {emailVeri} for a code
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
            <TouchableOpacity
              style={{
                height: 48,
                flex: 1,
                borderRadius: 8,
                backgroundColor: 'red',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={handleLater}
            >
              {/* <Link href={'/(protected)'}> */}
              <Text style={styles.buttonText}>Later</Text>
              {/* </Link> */}
            </TouchableOpacity>
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
      <ModalComp modalVisible={showCompleteProfileModal}>
        <CompleteProfile />
      </ModalComp>
    </Container>
  );
};

export default EmailConfirmation;

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
