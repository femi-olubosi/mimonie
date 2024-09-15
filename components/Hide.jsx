import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';

const Hide = ({ color, size }) => {
  return (
    <View style={{ flexDirection: 'row', columnGap: 2 }}>
      <FontAwesome5
        name="star-of-life"
        size={size ?? 10}
        color={color ?? 'white'}
      />
      <FontAwesome5
        name="star-of-life"
        size={size ?? 10}
        color={color ?? 'white'}
      />
      <FontAwesome5
        name="star-of-life"
        size={size ?? 10}
        color={color ?? 'white'}
      />
      <FontAwesome5
        name="star-of-life"
        size={size ?? 10}
        color={color ?? 'white'}
      />
    </View>
  );
};

export default Hide;

const styles = StyleSheet.create({});
