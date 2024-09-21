import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ProfileView = ({ name, picture, notifications, priText }) => {
  const [loading, setLoading] = useState(true);
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
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
            <>
              {loading && (
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                  style={{ position: 'absolute' }}
                />
              )}
              <Image
                source={{ uri: picture }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
                onLoadEnd={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
            </>
          ) : (
            <FontAwesome
              name="user-o"
              size={16}
              color={priText}
              onPress={() => router.navigate('/protected/account')}
            />
          )}
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'er', color: priText }}>
          Hi, {name?.split(' ')[0]}
        </Text>
      </View>
      {/* <Ionicons name="notifications-outline" size={24} color="black" /> */}
      <View
        style={{ flexDirection: 'row', columnGap: 10, alignItems: 'center' }}
      >
        <Feather name="help-circle" size={24} color="black" />
        <TouchableOpacity
          onPress={() => router.push('/protected/notifications')}
          style={{ position: 'relative' }}
        >
          <Ionicons name="notifications-outline" size={24} color={priText} />
          <View
            style={{
              borderRadius: 100,
              width: 15,
              height: 15,
              backgroundColor: 'red',
              position: 'absolute',
              top: -5,
              right: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 10, fontFamily: 'im' }}>
              {notifications?.filter((e) => !e.read).length || 0}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileView;

const styles = StyleSheet.create({});
