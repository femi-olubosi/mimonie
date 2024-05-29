import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';

const SplashScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.pri,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        source={require('../assets/logo/mimonie-logo.png')}
        style={{ width: 120, height: 120 }}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
