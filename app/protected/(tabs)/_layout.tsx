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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { priBg } = ThemeColors();

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
                name="account-circle-outline"
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
