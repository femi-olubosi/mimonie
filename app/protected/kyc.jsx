import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
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
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        {!userProfile.is_bvn_verified ? (
          <WebView
            source={{
              uri: 'https://links.sandbox.usesmileid.com/6982/955ebd44-e1b2-41a1-8f9d-804a7be4cdc0',
            }}
            style={styles.webview}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              Alert.alert('WebView error: ', nativeEvent.description);
            }}
          />
        ) : null}
      </ScrollView>
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    rowGap: 20,
  },
  webview: {
    flex: 1,
  },
});

export default kyc;
