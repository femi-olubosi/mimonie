import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import { PageView, SelectInput } from '../../components/Reusable';
import {
  fetchBanks,
  verifyBVN,
  getPaystackCustomer,
} from '@/api/payment.service';
import { Colors } from '../../constants/Colors';
import { useGlobalContext } from '../../store/StoreContext';
import { fetchUserProfile, updateUserProfile } from '../../api/user.service';
import { router } from 'expo-router';
import { ErrorCheck } from '../../utils/errorCheck';

const kyc = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [bvn, setBvn] = useState('');
  const [selectedValue, setSelectedValue] = useState({});
  const [bankList, setBankList] = useState([]);
  const { userProfile, currentUser, setUserProfile, setIsLoading } =
    useGlobalContext();

  const handleVerifyBVN = async () => {
    if (ErrorCheck({ accountNumber, bvn: bvn })) {
      return;
    }
    const data = {
      account_number: accountNumber,
      bvn: bvn,
      bank_code: selectedValue.value,
    };

    // if (userProfile.verification_in_progress) {
    //   alert(
    //     'Verification In Progress',
    //     `Hi ${userProfile.preferred_username}, Your BVN verification is in progress. Please check back shortly`
    //   );
    //   return;
    // }

    try {
      setIsLoading(true);
      const verify = await verifyBVN(data, userProfile);
      const res = await updateUserProfile(
        { verification_in_progress: true, bank_details: JSON.stringify(data) },
        currentUser
      );

      const fetch = await fetchUserProfile(setUserProfile, currentUser);
      console.log('fetch', fetch);
      Alert.alert(
        verify.message,
        'This will take upto 2-3 working days. Please be patient while weverify your document',
        [
          {
            text: 'OK',
            onPress: () => router.push('/protected/account'),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.log(error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const res = await fetchBanks();
      setBankList(res);
    })();
  }, []);

  return (
    <PageView title={'Document Verification'}>
      <View style={styles.container}>
        {/* <SelectInput
          options={[
            { value: 'bvn', label: 'BVN' },
            { value: 'nin', label: 'NIN' },
          ]}
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
          defaultValue={'Select document'}
        /> */}
        <TextInput
          style={styles.input}
          placeholder=""
          value={'BVN'}
          keyboardType="numeric"
          editable={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Account Number"
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="BVN"
          value={bvn}
          onChangeText={setBvn}
          keyboardType="numeric"
        />
        {/* <TextInput
          style={styles.input}
          placeholder="Bank Code"
          value={bankCode}
          onChangeText={setBankCode}
        /> */}
        <SelectInput
          options={bankList}
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
          defaultValue={'Select document'}
        />
        <Pressable onPress={handleVerifyBVN} style={{ alignSelf: 'center' }}>
          <Text style={{ color: Colors.pri, fontFamily: 'im' }}>Verify</Text>
        </Pressable>
      </View>
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
  input: {
    width: '100%',
    height: 51,
    padding: 10,
    borderWidth: 1,
    borderColor: '#9095A1',
    borderRadius: 12,
  },
});

export default kyc;
