import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGlobalContext } from '@/store/StoreContext';
import {
  createPaystackCustomer,
  fetchBanks,
  getPaystackCustomer,
  subAccount,
  verifyBVN,
} from '@/api/payment.service';

const Options = () => {
  const { userProfile } = useGlobalContext();
  const handleCustomer = async () => {
    console.log('object');
    const { name, phone, email } = userProfile;

    let first_name = name.split(' ')[0];
    let last_name = name.split(' ')[1];

    // const res = await createPaystackCustomer(
    //   email,
    //   first_name,
    //   last_name,
    //   phone
    // );

    // const resBVN = await verifyBVN('', '');
    // console.log({ resBVN });
    // const resGet = await getPaystackCustomer('CUS_vt4djmq0rc6qpbx');
    const res = await fetchBanks();
    // const res = await subAccount();
    console.log({ res });
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
      }}
    >
      <Pressable
        style={{ rowGap: 5, justifyContent: 'center', alignItems: 'center' }}
        onPress={() => router.push('/protected/groups')}
      >
        <Image
          source={require('../../assets/logo/group.png')}
          style={{ width: 33.5, height: 21.8 }}
        />
        <Text style={{ fontSize: 14, fontFamily: 'im' }}>Groups</Text>
      </Pressable>
      <Pressable
        style={{ rowGap: 5, justifyContent: 'center', alignItems: 'center' }}
        // onPress={() => router.push('/email_verify')}
        onPress={handleCustomer}
      >
        <Image
          source={require('../../assets/logo/bill.png')}
          style={{ width: 22, height: 22 }}
        />
        <Text style={{ fontSize: 14, fontFamily: 'im' }}>Pay bills</Text>
      </Pressable>
      <Pressable
        style={{
          rowGap: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <AntDesign name="question" size={25} color="black" />
        <Text style={{ fontSize: 14, fontFamily: 'im' }}>Help/FAQ</Text>
      </Pressable>
    </View>
  );
};

export default Options;

const styles = StyleSheet.create({});
