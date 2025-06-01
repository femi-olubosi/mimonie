import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import Loader from '@/components/Loader';
import { StoreProvider, useGlobalContext } from '@/store/StoreContext';
import '@azure/core-asynciterator-polyfill';
import Onboarding from './builder/Onboarding';
import initializeApp from '@/utils/initializeApp';
import useAppFonts from '@/hooks/useAppFonts';
// import useNotificationObserver from '@/hooks/useNotificationObserver';
import * as SplashScreen from 'expo-splash-screen';

Amplify.configure(amplifyconfig);
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  // useNotificationObserver();
  const [fontsLoaded] = useAppFonts();
  const [onboard, setOnboard] = useState(false);

  useEffect(() => {
    initializeApp(setOnboard);
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (onboard) {
    return <Onboarding setOnboard={setOnboard} />;
  }

  return (
    <StoreProvider>
      <RootContent />
    </StoreProvider>
  );
}

const screenOptions = { headerShown: false };

function RootContent() {
  const { isLoading, isAuth } = useGlobalContext();
  return (
    <>
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" />
        <Stack.Screen name="terms_condition" />
        <Stack.Screen name="(protected)" />
      </Stack>
      <Loader isLoading={isLoading} />
    </>
  );
}

export default RootLayout;
