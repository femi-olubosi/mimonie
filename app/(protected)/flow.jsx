import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text,
  Alert,
} from 'react-native';
import { PageView } from '../../components/Reusable';
import { useFirebaseLogin } from '../../captch';
import { useGlobalContext } from '@/store/StoreContext';
import { app, auth } from '../../firebase';
import { router } from 'expo-router';

const DocumentIdentification = () => {
  const { recaptcha, sendOtp } = useFirebaseLogin({
    auth: auth,
    firebaseConfig: app.options,
  });
  const [phone, setPhone] = useState('');
  const { setIsLoading, setConfirmationResult } = useGlobalContext();

  const sendVerification = async () => {
    if (phone.length < 7) {
      Alert.alert('Invalid', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const code = await sendOtp(phone);

      setConfirmationResult(code);
      router.push('/(protected)/device_verify');
    } catch (error) {
      console.error('Verification failed:', error);
      Alert.alert('Verification failed', 'Invalid phone number format');
    }
    setIsLoading(false);
  };

  return (
    <PageView title={'Identification'}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 40 }}>
        <TextInput
          style={{
            paddingHorizontal: 10,
            borderWidth: 1,
            padding: 10,
            marginBottom: 20,
          }}
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          autoCapitalize="none"
          keyboardType="phone-pad"
        />
        <View style={{ backgroundColor: 'red' }}>{recaptcha}</View>

        <TouchableOpacity
          onPress={sendVerification}
          style={{ backgroundColor: 'red', padding: 10 }}
        >
          <Text>Send OTP</Text>
        </TouchableOpacity>
      </View>
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
    marginBottom: 20,
  },
  status: {
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
});

export default DocumentIdentification;
