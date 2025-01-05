import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { ThemeColors } from '@/constants/Colors';

const Advert = () => {
  const {priBg} = ThemeColors()
  return (
    <View
      style={{
        width: '100%',
        padding: 20,
        backgroundColor: priBg,
      }}
    >
      <Image
        source={require('@/assets/images/advert.png')}
        style={{ width: '100%', borderRadius: 15, objectFit: 'fill' }}
      />
    </View>
  );
};

export default Advert;

const styles = StyleSheet.create({});
