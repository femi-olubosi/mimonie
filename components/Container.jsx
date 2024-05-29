import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const Container = ({ children }) => {
  return <View style={{ paddingHorizontal: 20, flex: 1 }}>{children}</View>;
};

export default Container;
