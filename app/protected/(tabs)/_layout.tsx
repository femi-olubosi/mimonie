import { Tabs } from 'expo-router';
import React from 'react';
import {
  Octicons,
  FontAwesome6,
  MaterialCommunityIcons,
  Entypo,
} from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].pri,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Octicons
              name="home"
              size={24}
              color={focused ? color : '#565D6D'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ color, focused }) => (
            <Entypo
              name="back-in-time"
              size={24}
              color={focused ? color : '#565D6D'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contact',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name="contact-book"
              size={24}
              color={focused ? color : '#565D6D'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={24}
              color={focused ? color : '#565D6D'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
