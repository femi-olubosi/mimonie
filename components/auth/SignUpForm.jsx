import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { AntDesign, Feather, Fontisto } from '@expo/vector-icons';
import Container from '../Container';
import { confirmSignUp, signUp } from 'aws-amplify/auth';
import Checkbox from 'expo-checkbox';
import { Colors } from '../../constants/Colors';
import { useGlobalContext } from '@/store/StoreContext';
import { ErrorCheck } from '../../utils/errorCheck';
import { createUserProfile } from '../../api/user.service';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAvoidingView, Platform } from 'react-native';

const SignUp = (props) => {
  // const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { handleSubmit, toSignIn } = props;
  const [isChecked, setChecked] = useState(false);
  const { setIsLoading, isLoading, setEmailVeri } = useGlobalContext();

  const handleSignUp = async () => {
    if (ErrorCheck({ password, email, phone_number })) {
      return;
    }

    if (!isChecked) {
      Alert.alert('Error', 'You must agree to the terms and conditions');
      return;
    }
    // const existing = (await AsyncStorage.getItem('userEmail')) || null;
    // if (existing) {
    //   Alert.alert('Error', `Device already registered with ${existing}`);
    //   return;
    // }

    const normalizedPhoneNumber = phone_number?.trim()?.startsWith('+2340')
      ? phone_number?.replace('+2340', '+234')
      : phone_number;

    setIsLoading(true);
    try {
      const { userId } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            preferred_username: email,
            phone_number: normalizedPhoneNumber,
          },
          autoSignIn: true,
        },
      });

      await AsyncStorage.setItem('userEmail', email);

      const device = {
        device_id: Device.osInternalBuildId || null,
        device_name: Device.deviceName || null,
        device_brand: Device.brand || null,
      };
      await createUserProfile(userId, device, email, normalizedPhoneNumber);
      setEmailVeri(email);
      router.push('/email_verify');
    } catch (error) {
      Alert.alert('Error', error?.message);
      console.error('Error signing up:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSignUp = () => {};

  console.log(email);
  return (
    <Container>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ marginBottom: 50 }}>
          <Text style={styles.title}>Register</Text>
          <Text style={{ textAlign: 'center' }}>Create your account</Text>
        </View>
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
          <Fontisto name="email" size={20} color="gray" />
          <TextInput
            style={{
              flex: 1,
              height: '100%',
              paddingHorizontal: 10,
              color: 'gray',
            }}
            placeholder="Enter your email"
            placeholderTextColor={'silver'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>
        <View
          style={[
            styles.input,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 0,
            },
          ]}
        >
          <Fontisto name="phone" size={20} color="gray" />
          <TextInput
            style={{
              flex: 1,
              height: '100%',
              paddingHorizontal: 10,
              color: 'gray',
            }}
            placeholder="Enter your phone number"
            placeholderTextColor={'silver'}
            value={phone_number}
            onChangeText={setPhone}
            autoCapitalize="none"
            keyboardType="phone-pad"
          />
        </View>
        <Text style={{ marginBottom: 20, marginLeft: 4, fontSize: 10 }}>
          Your country code followed by your phone number. e.g (+234)
        </Text>
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
          <Feather name="lock" size={20} color="gray" />
          <TextInput
            style={{
              flex: 1,
              height: '100%',
              paddingHorizontal: 10,
              color: 'gray',
            }}
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
        <View style={{ flexDirection: 'row', columnGap: 5 }}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? Colors.pri : undefined}
          />
          <View
            style={[
              styles.termsText,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                columnGap: 4,
              },
            ]}
          >
            <Text style={{}}>I agree with</Text>
            <Link href={'/terms_condition'}>
              <Text style={styles.signUp}>Terms & Conditions</Text>
            </Link>
          </View>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#006EBD',
            height: 51,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 40,
          }}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <Text style={{ fontSize: 18, color: 'white', fontFamily: 'ir' }}>
            {isLoading ? 'Loading...' : 'Sign Up'}
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
          <Text style={{}}>Already have an account?</Text>
          <Pressable onPress={toSignIn}>
            <Text style={styles.signUp}>Log In</Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
};

export default SignUp;

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
