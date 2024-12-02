import React from 'react';
import { Tabs } from 'expo-router';
import {
  Octicons,
  FontAwesome6,
  MaterialCommunityIcons,
  Entypo,
} from '@expo/vector-icons';
import { Colors, ThemeColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Platform, View } from 'react-native';
import { CopilotStep, walkthroughable } from 'react-native-copilot';
import { useGlobalContext } from '@/store/StoreContext';

const CopilotView = walkthroughable(View);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { userProfile, pilot } = useGlobalContext();
  const { priBg } = ThemeColors();

  // const accountSetupText =
  //   !userProfile?.is_bvn_verified && !userProfile?.is_nin_verified
  //     ? 'Open the Account screen to start verification. Verifying your BVN and Identity is essential to creating or participating in contributions.'
  //     : !userProfile?.is_bvn_verified
  //     ? 'Your BVN is not verified. Please verify your BVN to continue creating or participating in contributions.'
  //     : !userProfile?.is_nin_verified
  //     ? 'Your Identity (NIN) is not verified. Please verify your NIN to continue creating or participating in contributions.'
  //     : 'You are fully verified and ready to contribute!';

  const accountSetupText =
    'Open the Account screen to start verification. Verifying your BVN and Identity is essential to creating or participating in contributions.';
  return (
    <Tabs
      screenOptions={() => ({
        tabBarActiveTintColor: Colors.pri,
        tabBarInactiveTintColor: '#565D6D',
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderColor: '#FAFAFB',
          height: Platform.OS === 'android' ? 60 : 80,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: Platform.OS === 'android' ? 10 : 25,
          backgroundColor: priBg,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                borderTopWidth: focused ? 2 : 0,
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'flex-end',
                borderTopColor: focused
                  ? Colors[colorScheme ?? 'light'].pri
                  : 'transparent',
              }}
            >
              <Octicons name="home" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                borderTopWidth: focused ? 2 : 0,
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'flex-end',
                borderTopColor: focused
                  ? Colors[colorScheme ?? 'light'].pri
                  : 'transparent',
              }}
            >
              <Entypo name="back-in-time" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mimonie/index"
        options={{
          title: 'Mimonie',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                borderTopWidth: focused ? 2 : 0,
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'flex-end',
                borderTopColor: focused
                  ? Colors[colorScheme ?? 'light'].pri
                  : 'transparent',
              }}
            >
              <MaterialCommunityIcons
                name="hand-coin-outline"
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                borderTopWidth: focused ? 2 : 0,
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'flex-end',
                borderTopColor: focused
                  ? Colors[colorScheme ?? 'light'].pri
                  : 'transparent',
              }}
            >
              <FontAwesome6 name="contact-book" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <CopilotStep
              text={accountSetupText}
              order={0}
              name="accountSetup"
              active={pilot.account}
              // active={true}
            >
              <CopilotView
                style={{
                  borderTopWidth: focused ? 2 : 0,
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  borderTopColor: focused
                    ? Colors[colorScheme ?? 'light'].pri
                    : 'transparent',
                }}
              >
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={24}
                  color={color}
                />
              </CopilotView>
            </CopilotStep>
          ),
        }}
      />
    </Tabs>
  );
}
