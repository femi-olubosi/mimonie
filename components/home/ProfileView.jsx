import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Colors } from '@/constants/Colors';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ProfileView = ({
  name,
  picture,
  notifications,
  priText,
  setShowHelp,
}) => {
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications?.filter((e) => !e.read)?.length || 0;

  // Animation for dangle effect
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (unreadCount > 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();

      return () => loop.stop();
    }
  }, [unreadCount, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-20deg', '20deg'], // small swinging motion
  });

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
      }}
    >
      {/* Left side - Profile */}
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
              onPress={() => router.navigate('/(protected)/account')}
            />
          )}
        </View>
        <Text style={{ fontSize: 20, fontFamily: 'er', color: priText }}>
          Hi, {name?.split(' ')[0]}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          columnGap: 10,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/(protected)/notifications')}
          style={{ position: 'relative' }}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="notifications-outline" size={24} color={priText} />
          </Animated.View>
          {unreadCount > 0 && (
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
                {1}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileView;

const styles = StyleSheet.create({});
