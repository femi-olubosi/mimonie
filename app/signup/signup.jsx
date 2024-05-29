import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Container from '../../components/Container';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    // <SafeAreaView style={{ flex: 1 }}>
    <Container>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ marginBottom: 50 }}>
          <Text style={styles.title}>Register</Text>
          <Text style={{ textAlign: 'center' }}>Create your account</Text>
        </View>
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
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
              size={24}
              color="black"
            />
          </Pressable>
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
          // onPress={handleSignIn}
          // disabled={isLoading}
        >
          <Text style={{ fontSize: 18, color: 'white', fontFamily: 'ir' }}>
            {isLoading ? 'Loading...' : 'Log In'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Link href={'/'}>
            <Text style={styles.signUp}>Log In</Text>
          </Link>
        </Text>
      </View>
    </Container>
    // </SafeAreaView>
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
});
