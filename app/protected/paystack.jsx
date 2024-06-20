import React, { useEffect } from 'react';
import { Paystack } from 'react-native-paystack-webview';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useGlobalContext } from '../../store/StoreContext';
import { Colors } from '../../constants/Colors';
import { updateUserProfile } from '../../api/user.service';
import { verifyTransaction } from '../../api/payment.service';
function Pay() {
  const { currentUser } = useGlobalContext();
  const handleSuccess = async (res) => {
    const response = await verifyTransaction(
      res.transactionRef.reference,
      currentUser
    );
    if (response) {
      await updateUserProfile(
        { auth_url: response.authorization_code },
        currentUser
      );
      router.push('/protected/cards');
    } else {
      console.error('Transaction verification failed.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Paystack
        paystackKey={process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY}
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
