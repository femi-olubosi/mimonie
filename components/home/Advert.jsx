import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';

const Advert = () => {
  return (
    // <View style={{}}>
    <View
      style={{
        // height: 120,
        width: '100%',
        padding: 20,
        backgroundColor: 'white',
        // alignItems: 'center',
      }}
    >
      <Image
        source={require('@/assets/images/advert.png')}
        style={{ width: '100%', borderRadius: 15, objectFit: 'fill' }}
      />
    </View>
    // </View>
  );
};

export default Advert;

const styles = StyleSheet.create({});
