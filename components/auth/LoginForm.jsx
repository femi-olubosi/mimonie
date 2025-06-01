import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { signIn } from 'aws-amplify/auth';
import { useGlobalContext } from '@/store/StoreContext';
import { useRouter } from 'expo-router';
import { ErrorCheck } from '../../utils/errorCheck';
import { fetchCurrUser, fetchUserProfile } from '../../api/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataStore } from 'aws-amplify/datastore';
import { fetchUserActivities } from '@/api/activities.service';
import { handleProfileChecks } from '../../utils/profileCheck';

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
    setConfirmationResult,
    setUserActivities,
    setIsAuth,
    setProfilePicture,
  } = useGlobalContext();
  const router = useRouter();

  const handleSignIn = async () => {
    if (ErrorCheck({ email })) {
      return;
    }
    setIsLoading(true);
    try {
      await DataStore.start();
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      });

      if (!isSignedIn) {
        if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
          setEmailVeri(email);
          router.replace('/(protected)/email_verify');
          return;
        } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE') {
          setEmailVeri(email);
          router.replace('/(protected)/login_verify');
          return;
        } else {
          Alert.alert('', nextStep.signInStep);
          return;
        }
      }

      const user = await fetchCurrUser(setCurrentUser);

      const passed = handleProfileChecks(user, setConfirmationResult);

      if (!passed) return;

      await AsyncStorage.setItem('existingEmail', email);
      const picture = await AsyncStorage.getItem('profilePicture');
      setProfilePicture(picture);

      await fetchUserProfile(setUserProfile, user);
      await fetchUserActivities(user.userId, setUserActivities);

      await AsyncStorage.setItem('isAuth', 'true');
      setIsAuth(true);

      router.replace('/(protected)/(tabs)');
    } catch (error) {
      Alert.alert('Error', error.message || 'Network Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" enabled={false}>
      <View style={styles.container}>
        <Image
          source={require('../../assets/logo/mimonie.png')}
          style={{
            width: 70,
            height: 70,
            marginBottom: 40,
            borderRadius: 20,
            alignSelf: 'center',
          }}
        />
        <Text style={styles.title}>{'Log in'}</Text>
        <View>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor={'silver'}
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
              placeholderTextColor={'silver'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <Pressable onPress={() => setShowPass(!showPass)}>
              <Feather
                name={showPass ? 'eye' : 'eye-off'}
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
            width: '100%',
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
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
