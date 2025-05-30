import { useFonts } from 'expo-font';
import { Slot, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import Loader from '@/components/Loader';
import { StoreProvider, useGlobalContext } from '@/store/StoreContext';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import '@azure/core-asynciterator-polyfill';
import Onboarding from './builder/Onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
Amplify.configure(amplifyconfig);
import mobileAds from 'react-native-google-mobile-ads';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
import LoginForm from '@/components/auth/LoginForm';
import SignUp from '@/components/auth/SignUpForm';
import UserInactivityProvider from '@/components/UserInactivityProvider';
import { formFields } from '@/data/authFormField';
import { onFetchUpdateAsync } from '@/utils/helper';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    er: require('../assets/fonts/Epilogue/static/Epilogue-Regular.ttf'),
    em: require('../assets/fonts/Epilogue/static/Epilogue-Medium.ttf'),
    eb: require('../assets/fonts/Epilogue/static/Epilogue-Bold.ttf'),
    esb: require('../assets/fonts/Epilogue/static/Epilogue-SemiBold.ttf'),
    ir: require('../assets/fonts/Inter/static/Inter-Regular.ttf'),
    im: require('../assets/fonts/Inter/static/Inter-Medium.ttf'),
    ib: require('../assets/fonts/Inter/static/Inter-Bold.ttf'),
    isb: require('../assets/fonts/Inter/static/Inter-SemiBold.ttf'),
  });

  useEffect(() => {
    const prepare = async () => {
      try {
        if (!__DEV__) {
          await onFetchUpdateAsync();
        }

        // Initialize ads
        const { status: trackingStatus } =
          await requestTrackingPermissionsAsync();
        if (trackingStatus !== 'granted') {
          // Handle tracking not granted
        }
        await mobileAds().initialize();

        if (fontsLoaded) {
          SplashScreen.hideAsync();
        }
      } catch (error) {
        console.warn(error);
      }
    };

    prepare();
  }, [fontsLoaded]);

  return (
    <>
      <StoreProvider>
        <UserInactivityProvider>
          <RootContent />
        </UserInactivityProvider>
      </StoreProvider>
    </>
  );
}

export default RootLayout;

function RootContent() {
  const { isLoading } = useGlobalContext();

  return (
    <>
      <StatusBar style="dark" />
      <Authenticator.Provider>
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
          <Slot />
        </Authenticator>
      </Authenticator.Provider>
      <Loader isLoading={isLoading} />
    </>
  );
}
