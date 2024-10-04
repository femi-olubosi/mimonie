import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import WebView from 'react-native-webview';
import { verifyTransaction } from '@/api/payment.service';
import { updateContributionForUser } from '@/api/contributions.service';
import { useLocalSearchParams } from 'expo-router';
import { useGlobalContext } from '@/store/StoreContext';
import { PageView } from '@/components/Reusable';

const transfer_screen = () => {
  const { paymentUrl, id } = useLocalSearchParams();
  const { currentUser, userProfile, setIsLoading } = useGlobalContext();

  const handleNavigationChange = async (navState) => {
    const { url } = navState;

    if (url.includes('reference')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const reference = urlParams.get('reference');

      if (reference) {
        console.log('Reference found:', reference);

        try {
          setIsLoading(true);
          const verificationResponse = await verifyTransaction(
            reference,
            currentUser
          );
          if (verificationResponse.status === 'success') {
            await updateContributionForUser(id, userProfile.userId);
            router.push(`/protected/mimonie${id}`);
          } else {
            Alert.alert('Payment Failed', 'Could not verify payment');
          }
        } catch (error) {
          console.error('Error verifying transaction:', error);
          Alert.alert('Error', 'Something went wrong while verifying payment');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <PageView title={'Transfer'} route={`protected/mimonie/${id}`}>
      <View style={styles.container}>
        <WebView
          source={{ uri: 'https://google.com' }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={handleNavigationChange}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            Alert.alert('WebView error: ', nativeEvent.description);
          }}
        />
      </View>
    </PageView>
  );
};

export default transfer_screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    minHeight: Dimensions.get('window').height,
  },
});
