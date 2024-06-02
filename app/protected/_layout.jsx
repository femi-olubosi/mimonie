import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import React from 'react';
import {
  Authenticator,
  ThemeProvider,
  useAuthenticator,
  useTheme,
} from '@aws-amplify/ui-react-native';
import { Slot, Stack } from 'expo-router';
import { I18n } from 'aws-amplify/utils';
import LoginForm from '../../components/auth/LoginForm';
import SignUp from '../../components/auth/SignUpForm';

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
};

const i8N = I18n.putVocabulariesForLanguage('en', {
  'Sign In': 'Login', // Tab header
  'Sign in': 'Log in', // Button label
  'Sign in to your account': 'Welcome Back!',
  Username: 'Enter your username', // Username label
  Password: 'Enter your password', // Password label
  'Forgot your password?': 'Reset Password',
});

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

const MyAppHeader = () => {
  const {
    tokens: { space, fontSizes },
  } = useTheme();

  const { route } = useAuthenticator((context) => [context.route]);

  return (
    <View>
      {route === 'signIn' ? (
        <View>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 24,
              marginTop: 20,
              fontFamily: 'esb',
            }}
          >
            Log In
          </Text>
        </View>
      ) : route === 'signUp' ? (
        <View
          style={{
            marginTop: 20,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 24,
              marginBottom: 5,
              fontFamily: 'esb',
            }}
          >
            Register
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 15,

              fontFamily: 'er',
            }}
          >
            Create you user account
          </Text>
        </View>
      ) : null}
    </View>
  );
};

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
          paddingTop: 10,
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
          </Stack>
        </Authenticator>
      </View>
    </View>
  );
};
