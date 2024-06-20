import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ProfileView = ({ username, picture }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          columnGap: 10,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: picture ? 0 : 10,
            backgroundColor: Colors.sec,
            borderRadius: 100,
          }}
        >
          {picture ? (
            <Image
              source={{ uri: picture }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />
          ) : (
            <FontAwesome
              name="user-o"
              size={16}
              color="white"
              onPress={() => router.navigate('/protected/account')}
            />
          )}
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'er' }}>Hi, {username}</Text>
      </View>
      <Ionicons name="notifications-outline" size={24} color="black" />
    </View>
  );
};

export default ProfileView;

const styles = StyleSheet.create({});
