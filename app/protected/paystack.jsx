import React from 'react';
import { Paystack } from 'react-native-paystack-webview';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useGlobalContext } from '../../store/StoreContext';
import { Colors } from '../../constants/Colors';
function Pay() {
  const { currentUser } = useGlobalContext();
  const handleSuccess = async (res) => {
    console.log(res.transactionRef.reference);
    const verificationSuccess = await verifyTransaction(
      res.transactionRef.reference
    );

    if (verificationSuccess) {
      router.push('/protected/cards');
    } else {
      // Handle verification failure (optional)
      console.error('Transaction verification failed.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Paystack
        paystackKey="pk_test_093108e7d85bafd70a91edd17c95e3d10d811103"
        amount={'50.00'}
        billingEmail={currentUser.email}
        activityIndicatorColor={Colors.pri}
        onCancel={(e) => {
          // handle response here
          router.push('/protected/cards');
        }}
        onSuccess={(res) => {
          // handle response here
          handleSuccess(res);
        }}
        autoStart={true}
      />
    </View>
  );
}

export default Pay;
