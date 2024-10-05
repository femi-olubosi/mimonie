import { Alert, Dimensions, StyleSheet, View } from 'react-native';
import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useGlobalContext } from '@/store/StoreContext';
import { PageView } from '@/components/Reusable';
import { Paystack } from 'react-native-paystack-webview';
import { verifyTransfer } from '@/api/payment.service';
import {
  updateContributionForUser,
  fetchUserContributions
} from '@/api/contributions.service';
import { Colors } from '../../constants/Colors';

const transfer_screen = () => {
  const { id, amount, subaccount_code, contribution } = useLocalSearchParams();
  const { userProfile, setIsLoading, setContributions, currentUser } = useGlobalContext();

  const handleSuccess = async (res) => {
    setIsLoading(true)
    try {
      const verificationResponse = await verifyTransfer(
        res.transactionRef.reference,
      );
      if (verificationResponse?.status === 'success') {
        await updateContributionForUser(contribution, userProfile);
        await fetchUserContributions(currentUser?.userId, setContributions);
        Alert.alert(
          'Payment Successful',
          'Your contribution has been updated',
          [
            {
              text: 'OK',
              onPress: () => router.push(`/protected/mimonie/${id}`),
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Payment Failed', 'Could not verify payment');
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <PageView title={'Transfer'} route={`protected/mimonie/${id}`}>
      <View style={{ flex: 1 }}>
        <Paystack
          paystackKey={process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY}
          amount={amount}
          billingEmail={userProfile.email}
          activityIndicatorColor={Colors.pri}
          subaccount={subaccount_code}
          channels={['bank_transfer']}
          onCancel={(e) => {
            router.push(`/protected/mimonie/${id}`);
          }}
          onSuccess={(res) => {
            handleSuccess(res);
          }}
          autoStart={true}
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
