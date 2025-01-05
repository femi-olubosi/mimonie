import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../constants/Colors';

export function SelectedCircle() {
  return (
    <View style={styles.selectedCircle}>
      <View style={styles.innerCircle} />
    </View>
  );
}

export function UnSelectedCircle() {
  return <View style={styles.unselectedCircle} />;
}

const styles = StyleSheet.create({
  selectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.pri,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.pri,
  },
  unselectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'gray',
  },
});
