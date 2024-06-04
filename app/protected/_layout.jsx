import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import React from 'react';
import {
  Authenticator,
  ThemeProvider,
  useAuthenticator,
} from '@aws-amplify/ui-react-native';
import { Stack } from 'expo-router';
import LoginForm from '../../components/auth/LoginForm';
import SignUp from '../../components/auth/SignUpForm';
import { StatusBar } from 'expo-status-bar';

const theme = {
  tokens: {
    colors: {
      primary: {
        10: '#006EBD',
        20: '#006EBD',
        40: '#006EBD',
        60: '#006EBD',
        80: '#006EBD',
        90: '#006EBD',
        100: '#006EBD',
      },
      font: {
        primary: 'black',
      },
    },
  },
};

const formFields = {
  signUp: {
    username: {
      labelHidden: false,
      isRequired: true,
      order: 1,
    },
    email: {
      labelHidden: false,
      isRequired: true,
      order: 2,
    },
    password: {
      isRequired: true,
      order: 3,
    },
  },
  forgotPassword: {
    username: {
      labelHidden: false,
      placeholder: 'Enter your email address',
      isRequired: true,
      label: 'Email Address:',
    },
  },
};

const ProtectedLayout = () => {
  return (
    <ThemeProvider theme={theme}>
      <Authenticator.Provider>
        <ProtectedContent />
      </Authenticator.Provider>
    </ThemeProvider>
  );
};

export default ProtectedLayout;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#006EBD',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  footerText: {
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
  },
  signUpText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

const ProtectedContent = () => {
  const { route } = useAuthenticator((context) => [context.route]);

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      {route === 'signIn' || route === 'forgotPassword' ? (
        <View
          style={{
            flex: 1,
            backgroundColor: '#006EBD',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={require('../../assets/logo/mimonie-logo.png')}
            style={{ width: 120, height: 120 }}
          />
        </View>
      ) : null}
      <View
        style={{
          flex: 2,
          borderRadius: 10,
          paddingTop: route === 'signIn' || route === 'forgotPassword' ? 10 : 0,
          backgroundColor: 'white',
        }}
      >
        <Authenticator
          formFields={formFields}
          components={{
            SignIn: (props) => {
              return <LoginForm {...props} />;
            },
            SignUp: (props) => {
              return <SignUp {...props} />;
            },
          }}
          services={{
            handleSignUp: async ({ username, password, attributes }) => {
              console.log(username, password, attributes);
            },
            handleSignIn: async ({ username, password }) => {
              console.log(username, password);
            },
          }}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="personal_info"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile_edit"
              options={{ headerShown: false }}
            />
          </Stack>
        </Authenticator>
      </View>
    </View>
  );
};
