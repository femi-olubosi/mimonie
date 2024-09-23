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
Amplify.configure(amplifyconfig);

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

  const [isSignedIn, setIsSignedIn] = useState(null);

  // useEffect(() => {
  //   const checkAuthStatus = async () => {
  //     try {
  //       const session = await fetchAuthSession();
  //       setIsSignedIn(!!session.tokens.accessToken);
  //     } catch (error) {
  //       setIsSignedIn(false);
  //     } finally {
  //       setIsSplashVisible(false);
  //     }
  //   };

  //   checkAuthStatus();
  // }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Fetch the session but do not force a refresh
        const session = await fetchAuthSession({ forceRefresh: false });
        console.log('session', session)
        const tokenExpiry = session?.tokens?.accessToken?.payload?.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        // Check if the token has expired
        if (!tokenExpiry || currentTime > tokenExpiry) {
          throw new Error('Token has expired');
        }

        setIsSignedIn(!!session.tokens.accessToken);
      } catch (error) {
        await signOut();
        setIsSignedIn(false);
      } finally {
        setIsSplashVisible(false);
      }
    };

    checkAuthStatus();
  }, []);


  return (
    <>
      {isSplashVisible ? (
        <SplashScreen />
      ) : (
        <StoreProvider>
          {/* <SafeAreaProvider> */}
          <RootContent />
          {/* </SafeAreaProvider> */}
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
        <Stack.Screen name="protected" options={{ headerShown: false }} />
      </Stack>
      <Loader isLoading={isLoading} />
    </>
  );
}
