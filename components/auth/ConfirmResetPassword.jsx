import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { confirmResetPassword } from 'aws-amplify/auth';

const ConfirmForgotPassword = ({ email, toSignIn }) => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmReset = async () => {
    if (!email || !code || !newPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    setIsLoading(true);
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
      Alert.alert('Success', 'Password reset successful. You can now sign in.');
      toSignIn();
    } catch (error) {
      Alert.alert('Error', error.message || 'Invalid code or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the code sent to {email} and set a new password.
        </Text>

        <Text style={styles.label}>Verification Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter code"
          placeholderTextColor={'silver'}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={{ flex: 1 }}
            placeholder="Enter new password"
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
          style={styles.button}
          onPress={handleConfirmReset}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Processing...' : 'Confirm Reset'}
          </Text>
        </TouchableOpacity>

        <Pressable onPress={toSignIn}>
          <Text style={styles.backToSignIn}>Back to Sign In</Text>
        </Pressable>
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
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'esb',
  },
  subtitle: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'isb',
  },
  input: {
    height: 51,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 51,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fff',
    height: 51,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    color: Colors.pri,
    fontFamily: 'ib',
  },
  backToSignIn: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 25,
  },
});

export default ConfirmForgotPassword;
