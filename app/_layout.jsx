import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import Loader from '@/components/Loader';
import { StoreProvider, useGlobalContext } from '@/store/StoreContext';
import '@azure/core-asynciterator-polyfill';
// import Onboarding from './builder/Onboarding';
import initializeApp from '@/utils/initializeApp';
import useAppFonts from '@/hooks/useAppFonts';
import * as SplashScreen from 'expo-splash-screen';
import useAuthHubListener, { userId } from '@/hooks/hubListener';
import useNotificationObserver from '@/hooks/useNotificationObserver';
import { DataStore, syncExpression } from '@aws-amplify/datastore';
import {
  Contribution,
  ContributionGroups,
  ContributionParticipant,
  Request,
  UserActivity,
  UserBankDetails,
  UserCardDetails,
  UserConnections,
  UserNotifications,
  UserProfile,
} from '@/src/models';
import useSyncListener from '@/hooks/useSyncListener';

DataStore.configure({
  syncExpressions: [
    syncExpression(UserProfile, () => {
      return (profile) => profile.userId.eq(userId);
    }),
    syncExpression(UserNotifications, () => {
      return (notification) =>
        notification.or((n) => [n.userId.eq(userId), n.global.eq(true)]);
    }),
    syncExpression(UserActivity, () => {
      return (activity) => activity.userId.eq(userId);
    }),
    syncExpression(UserBankDetails, () => {
      return (bank) => bank.userId.eq(userId);
    }),
    syncExpression(Request, () => {
      return (request) => request.userId.eq(userId);
    }),
    syncExpression(UserCardDetails, () => {
      return (card) => card.userId.eq(userId);
    }),
    syncExpression(UserConnections, () => {
      return (connection) =>
        connection.or((c) => [c.senderId.eq(userId), c.receiverId.eq(userId)]);
    }),
    syncExpression(Contribution, () => {
      return (contribution) => contribution.access.contains(userId);
    }),
    syncExpression(ContributionParticipant, () => {
      return (participant) =>
        participant.or((p) => [
          p.contribution_owner_id.eq(userId),
          p.userId.eq(userId),
        ]);
    }),
    syncExpression(ContributionGroups, () => {
      return (group) => group.name.eq('_userId_');
    }),
  ],
});

Amplify.configure(amplifyconfig);

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  useNotificationObserver();
  useAuthHubListener();
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

  // useEffect(() => {
  //   user
  // })

  // if (onboard) {
  //   return <Onboarding setOnboard={setOnboard} />;
  // }

  return (
    <StoreProvider>
      <RootContent />
    </StoreProvider>
  );
}

const screenOptions = { headerShown: false };

function RootContent() {
  const { isLoading, setIsReady } = useGlobalContext();
  useSyncListener(setIsReady);

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
