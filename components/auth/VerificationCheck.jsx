import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import Container from '../Container';
import { Colors } from '../../constants/Colors';
import { signOut } from 'aws-amplify/auth';
import { useGlobalContext } from '@/store/StoreContext';
import { router } from 'expo-router';
import { useFirebaseLogin } from '../../captch';
import { app, auth } from '../../firebase';

const VerificationCheck = () => {
  const { setIsLoading, setConfirmationResult, userProfile } =
    useGlobalContext();

  const { recaptcha, sendOtp } = useFirebaseLogin({
    auth: auth,
    firebaseConfig: app.options,
  });

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      const code = await sendOtp(userProfile?.phone_number);
      setConfirmationResult(code);
      router.push('/protected/device_verify');
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View>{recaptcha}</View>
        <View
          style={{
            backgroundColor: 'white',
            paddingVertical: 50,
            borderRadius: 24,
            paddingHorizontal: 20,
          }}
        >
          <Text style={[styles.title, { marginBottom: 10 }]}>
            Verify your phone number
          </Text>
          <Text style={{ marginBottom: 60, textAlign: 'center', fontSize: 16 }}>
            You will have to solve the captcha to confirm you are human
          </Text>
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
              <TouchableOpacity onPress={() => signOut()}>
                <Text style={styles.buttonText}>Later</Text>
              </TouchableOpacity>
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
              onPress={handleSendCode}
            >
              <Text style={styles.buttonText}>Send Code</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Container>
  );
};

export default VerificationCheck;

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
