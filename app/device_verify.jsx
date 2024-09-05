import { StyleSheet, View } from 'react-native';
import React from 'react';
import DeviceVerification from '@/components/auth/DeviceVerification';

const device_verify = () => {
  return (
    <View style={{ flex: 1 }}>
      <DeviceVerification />
    </View>
  );
};

export default device_verify;
