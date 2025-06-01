import { View, StyleSheet, Image } from 'react-native';
import React from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
import { Stack } from 'expo-router';
import LoginForm from '../../components/auth/LoginForm';
import SignUp from '../../components/auth/SignUpForm';
import { formFields } from '../../data/authFormField';
import { StatusBar } from 'expo-status-bar';

const ProtectedLayout = () => {
  return (
    <Authenticator.Provider>
      <ProtectedContent />
    </Authenticator.Provider>
  );
};

export default ProtectedLayout;

const ProtectedContent = () => {
  const { route } = useAuthenticator((context) => [context.route]);

  return (
    <>
      <StatusBar style="dark" />
      {['forgotPassword', 'signIn', 'signUp'].includes(route) && (
        <View
          style={{
            height: 60,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        ></View>
      )}
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
          <Stack.Screen name="personal_info" options={{ headerShown: false }} />
          <Stack.Screen name="profile_edit" options={{ headerShown: false }} />
          <Stack.Screen name="groups" options={{ headerShown: false }} />
          <Stack.Screen name="mimonie/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="help/[slug]" options={{ headerShown: false }} />
          <Stack.Screen
            name="create_contribution"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="cards" options={{ headerShown: false }} />
          <Stack.Screen name="paystack" options={{ headerShown: false }} />
          <Stack.Screen name="kyc" options={{ headerShown: false }} />
          <Stack.Screen
            name="transfer_screen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="complete_profile"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="verification_check"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="email_verify" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="bvn" options={{ headerShown: false }} />
          <Stack.Screen name="login_verify" options={{ headerShown: false }} />
          <Stack.Screen name="flow" options={{ headerShown: false }} />
          <Stack.Screen name="my_invites" options={{ headerShown: false }} />
          <Stack.Screen name="my_network" options={{ headerShown: false }} />
          <Stack.Screen name="faq" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="support" options={{ headerShown: false }} />
          <Stack.Screen name="privacy" options={{ headerShown: false }} />
          <Stack.Screen name="smile_id" options={{ headerShown: false }} />
          <Stack.Screen name="take_selfie" options={{ headerShown: false }} />
          <Stack.Screen name="upload_doc" options={{ headerShown: false }} />
          <Stack.Screen
            name="completed_screen"
            options={{ headerShown: false }}
          />
        </Stack>
      </Authenticator>
    </>
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
