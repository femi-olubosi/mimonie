import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { ErrorCheck } from '../../utils/errorCheck';

const ForgotPasswordForm = ({ toSignIn }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [stage, setStage] = useState('request');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async () => {
    if (ErrorCheck({ email })) return;
    setIsLoading(true);
    try {
      await resetPassword({ username: email });
      setStage('confirm');
      Alert.alert(
        'Verification Code Sent',
        'Please check your email for the code.'
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!code || !newPassword) {
      Alert.alert('', 'Please enter both code and new password.');
      return;
    }

    setIsLoading(true);
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
      Alert.alert(
        'Success',
        'Password reset successfully. You can now log in.'
      );
      toSignIn();
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      enabled={false}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Image
          source={require('../../assets/logo/mimonie-logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>
          {stage === 'request' ? 'Forgot Password' : 'Reset Password'}
        </Text>

        {/* Email Input */}
        {stage === 'request' && (
          <>
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

            <TouchableOpacity
              style={styles.btn}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              <Text style={styles.btnText}>
                {isLoading ? 'Sending...' : 'Send Code'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Code + New Password Input */}
        {stage === 'confirm' && (
          <>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter verification code"
              placeholderTextColor={'silver'}
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
            />

            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={{ flex: 1, height: '100%' }}
                placeholder="Enter your new password"
                placeholderTextColor={'silver'}
                secureTextEntry={!showPass}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Pressable onPress={() => setShowPass(!showPass)}>
                <Feather
                  name={showPass ? 'eye' : 'eye-off'}
                  size={20}
                  color="gray"
                />
              </Pressable>
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={handleConfirmReset}
              disabled={isLoading}
            >
              <Text style={styles.btnText}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Back to login */}
        <View style={styles.footer}>
          <Text style={{ color: '#fff' }}>Remembered your password?</Text>
          <Pressable onPress={toSignIn}>
            <Text style={styles.signIn}>Log in</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 40,
    borderRadius: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
    fontFamily: 'esb',
    color: '#fff',
  },
  label: {
    fontFamily: 'isb',
    fontSize: 18,
    marginBottom: 5,
    color: '#fff',
  },
  input: {
    width: '100%',
    height: 51,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 14,
    color: 'black',
  },
  passwordInput: {
    width: '100%',
    height: 51,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    backgroundColor: '#fff',
    height: 51,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: {
    fontSize: 18,
    color: Colors.pri,
    fontFamily: 'ib',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 4,
    marginTop: 30,
  },
  signIn: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
