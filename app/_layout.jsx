import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import SplashScreen from '../components/SplashScreen';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import Loader from '@/components/Loader';
import { StoreProvider, useGlobalContext } from '@/store/StoreContext';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import '@azure/core-asynciterator-polyfill';
import Onboarding from './builder/Onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
Amplify.configure(amplifyconfig);
import * as Updates from 'expo-updates';
import { CopilotProvider } from 'react-native-copilot';

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

  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [onboard, setOnboard] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await fetchAuthSession({ forceRefresh: false });
        const tokenExpiry = session?.tokens?.accessToken?.payload?.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        if (!tokenExpiry || currentTime > tokenExpiry) {
          throw new Error('Token has expired');
        }
      } catch (error) {
        await signOut();
      } finally {
        setIsSplashVisible(false);
      }
    };

    checkAuthStatus();
  }, []);

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  // useEffect(() => {
  //   const checkFirstTimeUser = async () => {
  //     const isFirstLaunch = await AsyncStorage.getItem('hasLaunched');
  //     if (isFirstLaunch === null) {
  //       setOnboard(true);
  //       await AsyncStorage.setItem('hasLaunched', 'true');
  //     }
  //   };
  //   checkFirstTimeUser();
  // }, []);

  const style = {
    borderRadius: 10,
    padding: 5,
    color: 'red',
  };

  return (
    <>
      {isSplashVisible ? (
        <SplashScreen />
      ) : (
        // : onboard ? (
        //   <Onboarding setOnboard={setOnboard} />
        // )
        <StoreProvider>
          <CopilotProvider tooltipStyle={style}>
            <RootContent />
          </CopilotProvider>
        </StoreProvider>
      )}
    </>
  );
}

export default RootLayout;

function RootContent() {
  const { isLoading } = useGlobalContext();

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="email_verify" options={{ headerShown: false }} />
        <Stack.Screen name="login_verify" options={{ headerShown: false }} />
        <Stack.Screen name="device_verify" options={{ headerShown: false }} />
        <Stack.Screen name="terms_condition" options={{ headerShown: false }} />
        <Stack.Screen name="protected" options={{ headerShown: false }} />
      </Stack>
      <Loader isLoading={isLoading} />
    </>
  );
}
