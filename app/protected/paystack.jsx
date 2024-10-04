import React, { useEffect } from 'react';
import { Paystack } from 'react-native-paystack-webview';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useGlobalContext } from '../../store/StoreContext';
import { Colors } from '../../constants/Colors';
import { fetchUserProfile, updateUserProfile } from '../../api/user.service';
import { verifyTransaction } from '../../api/payment.service';
import { createNotification } from '../../api/notifications.service';
function Pay() {
  const { currentUser, setNotifications, setUserProfile } = useGlobalContext();

  const handleSuccess = async (res) => {
    const response = await verifyTransaction(
      res.transactionRef.reference,
      currentUser
    );
    console.log({ response });
    if (response) {
      await updateUserProfile(
        { auth_url: response.authorization_code },
        currentUser
      );
      await createNotification(
        {
          title: 'Card added',
          content: `You have successfully added a ${response.bank} to your cards collections. Your new card will be the active card`,
          type: 'card',
          userId: currentUser.userId,
          read: false,
        },
        setNotifications
      );
      await fetchUserProfile(setUserProfile, currentUser);
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
        channels={["bank"]}
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
