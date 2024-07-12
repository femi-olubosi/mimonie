import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { PageView } from '../../components/Reusable';
import { useGlobalContext } from '../../store/StoreContext';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';

const kyc = () => {
  const { userProfile, setIsLoading } = useGlobalContext();

  useEffect(() => {
    if (userProfile.is_bvn_verified) {
      Alert.alert(
        'Verification',
        'This user is already verified',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
        { cancelable: false }
      );
    }
  }, []);

  return (
    <PageView title={'Verification'} route={'/protected/account'}>
      <WebView
        source={{
          uri: 'https://links.sandbox.usesmileid.com/6982/224e85f5-3ed7-4626-97c2-955bd221bfeb',
        }}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          Alert.alert('WebView error: ', nativeEvent.description);
        }}
      />
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 20,
  },
  webview: {
    flex: 1,
  },
});

export default kyc;
