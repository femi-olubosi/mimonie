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
import useAuthHubListener, { getCurrentUserId } from '@/hooks/hubListener';
import useNotificationObserver from '@/hooks/useNotificationObserver';
import {
  AuthModeStrategyType,
  DataStore,
  syncExpression,
} from '@aws-amplify/datastore';
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
  authModeStrategyType: AuthModeStrategyType.MULTI_AUTH,
  syncExpressions: [
    syncExpression(UserProfile, () => {
      const id = getCurrentUserId();
      return (profile) => profile.userId.eq(id);
    }),
    syncExpression(UserNotifications, () => {
      const id = getCurrentUserId();
      return (notification) =>
        notification.or((n) => [n.userId.eq(id), n.global.eq(true)]);
    }),
    syncExpression(UserActivity, () => {
      const id = getCurrentUserId();
      return (activity) => activity.userId.eq(id);
    }),
    syncExpression(UserBankDetails, () => {
      const id = getCurrentUserId();
      return (bank) => bank.userId.eq(id);
    }),
    syncExpression(Request, () => {
      const id = getCurrentUserId();
      return (request) => request.userId.eq(id);
    }),
    syncExpression(UserCardDetails, () => {
      const id = getCurrentUserId();
      return (card) => card.userId.eq(id);
    }),
    syncExpression(UserConnections, () => {
      const id = getCurrentUserId();
      return (connection) =>
        connection.or((c) => [c.senderId.eq(id), c.receiverId.eq(id)]);
    }),
    syncExpression(Contribution, () => {
      const id = getCurrentUserId();
      return (contribution) => contribution.access.contains(id);
    }),
    syncExpression(ContributionParticipant, () => {
      const id = getCurrentUserId();
      return (participant) =>
        participant.or((p) => [
          p.contribution_owner_id.eq(id),
          p.userId.eq(id),
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
        <Stack.Screen name="email_verify" />
        <Stack.Screen name="terms_condition" />
        <Stack.Screen name="(protected)" />
      </Stack>
      <Loader isLoading={isLoading} />
    </>
  );
}

export default RootLayout;
