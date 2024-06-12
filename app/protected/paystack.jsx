import React, { useEffect } from 'react';
import { Paystack } from 'react-native-paystack-webview';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useGlobalContext } from '../../store/StoreContext';
import { Colors } from '../../constants/Colors';
function Pay() {
  const { currentUser } = useGlobalContext();
  const handleSuccess = async (res) => {
    console.log(res.transactionRef.reference);
    router.push('/protected/cards');
    return;
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
        paystackKey=""
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
