import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { signIn } from 'aws-amplify/auth';
import { useGlobalContext } from '@/store/StoreContext';
import { router } from 'expo-router';
import { ErrorCheck } from '../../utils/errorCheck';
import { fetchCurrUser, fetchUserProfile } from '../../api/user.service';
import * as Device from 'expo-device';
import { fetchUserNotification } from '../../api/notifications.service';
import { convertToAWSDate } from '../../utils/toAWSDate';

const LoginForm = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { toSignUp, toForgotPassword } = props;
  const {
    isLoading,
    setIsLoading,
    setEmailVeri,
    setCurrentUser,
    setUserProfile,
    userProfile,
    setNotifications,
  } = useGlobalContext();

  const handleSignIn = async () => {
    if (ErrorCheck({ email })) {
      return;
    }
    setIsLoading(true);
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      });

      if (!isSignedIn) {
        if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
          setEmailVeri(email);
          router.push('/email_verify');
          return;
        } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE') {
          setEmailVeri(email);
          router.push('/login_verify');
          return;
        } else {
          Alert.alert('', nextStep.signInStep);
          return;
        }
      }
      const user = await fetchCurrUser(setCurrentUser);
      const profile = await fetchUserProfile(setUserProfile, user);
      await fetchUserNotification(user.userId, setNotifications);
      if (profile.device_id && profile.device_id !== Device.osInternalBuildId) {
        Alert.alert(
          'Device Mismatch',
          `This user is already signed in on ${profile.device_name}. Do you want to register this new device?`,
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'Register',
              onPress: async () => {
                // Send verification code to user's phone number
                await sendVerificationCode(user.phone_number);
                router.push('/device_verify'); // Navigate to device verification screen
              },
            },
          ],
          { cancelable: false }
        );
      }

      if (!userProfile?.name) {
        router.push('/protected/complete_profile');
        return;
      }
      router.push('/protected');
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={false}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Log in</Text>
        <View>
          <Text style={styles.label}>Email Adrress</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View>
          <Text style={styles.label}>Password</Text>
          <View
            style={[
              styles.input,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}
          >
            <TextInput
              style={{ flex: 1, height: '100%' }}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <Pressable onPress={() => setShowPass(!showPass)}>
              <Feather
                name={showPass ? 'eye-off' : 'eye'}
                size={20}
                color="gray"
              />
            </Pressable>
          </View>
        </View>
        <Pressable onPress={toForgotPassword}>
          <Text style={{ color: 'gray', textAlign: 'right' }}>
            Forgot Password
          </Text>
        </Pressable>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.pri,
            height: 51,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 40,
          }}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          <Text style={{ fontSize: 18, color: 'white', fontFamily: 'ir' }}>
            {isLoading ? 'Loading...' : 'Log In'}
          </Text>
        </TouchableOpacity>
        <View
          style={[
            styles.footerText,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              columnGap: 4,
            },
          ]}
        >
          <Text style={{}}>Don't have an account?</Text>
          <Pressable onPress={toSignUp}>
            <Text style={styles.signUp}>Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
    fontFamily: 'esb',
  },
  input: {
    width: '100%',
    height: 51,
    padding: 10,
    borderWidth: 1,
    borderColor: '#9095A1',
    borderRadius: 8,
    marginBottom: 14,
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
  label: {
    fontFamily: 'isb',
    fontSize: 18,
    marginBottom: 5,
    color: '#424856',
  },
});

export default LoginForm;
