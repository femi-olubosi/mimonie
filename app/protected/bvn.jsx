import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Colors } from '../../constants/Colors';
import { PageView, SelectInput } from '../../components/Reusable';
import { fetchBanks, verifyBVN } from '../../api/payment.service';
import { ErrorCheck } from '../../utils/errorCheck';
import { useGlobalContext } from '../../store/StoreContext';
import { fetchUserProfile, updateUserProfile } from '../../api/user.service';
import { createNotification } from '../../api/notifications.service';
import { router } from 'expo-router';

const Bvn = () => {
  const [wait, setWait] = useState(true);
  const [bvn, setBvn] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [banks, setBanks] = useState([]);
  const [selectedValue, setSelectedValue] = useState({});
  const {
    setIsLoading,
    userProfile,
    setUserProfile,
    currentUser,
    setNotifications,
  } = useGlobalContext();

  useEffect(() => {
    setTimeout(() => {
      setWait(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (userProfile.is_bvn_verified || userProfile.verification_in_progress) {
      Alert.alert(
        'BVN Verification',
        'This user BVN is already verified or the verification is in progress',
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

  useEffect(() => {
    (async () => {
      const banks = await fetchBanks();
      setBanks(banks);
    })();
  }, []);

  const handleVerify = async () => {
    if (ErrorCheck({ bvn, accountNumber })) {
      return;
    }
    try {
      setIsLoading(true);
      await verifyBVN(
        { bvn, accountNumber, bankCode: selectedValue.value },
        userProfile
      );

      await updateUserProfile({ verification_in_progress: true }, currentUser);
      await fetchUserProfile(setUserProfile, currentUser);

      await createNotification(
        {
          title: 'Verification In Progress',
          content: `You have successfully processed your BVN verification. You will be notified when the verification is complete`,
          type: 'alert',
          userId: currentUser.userId,
          read: false,
        },
        setNotifications
      );

      Alert.alert(
        'We have recieved your request',
        'We will notify you when your BVN is verified',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.log(error);
      Alert.alert('error', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageView title={'Verify BVN'}>
      {wait ? (
        <View style={styles.container}>
          <ActivityIndicator size={'large'} color={Colors.pri} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container_1}>
            <Text style={styles.label}>BVN Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your BVN number"
              keyboardType="numeric"
              value={bvn}
              onChangeText={setBvn}
            />
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your account number tied to BVN"
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />
            <Text style={styles.hint}>
              Hint: This should be the account number tied to your BVN
            </Text>
            <Text style={styles.label}>Bank Name</Text>
            <View style={{ width: '100%' }}>
              <SelectInput
                options={banks}
                selectedValue={selectedValue}
                setSelectedValue={setSelectedValue}
                defaultValue={selectedValue?.label}
              />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleVerify}
              disabled={wait}
            >
              <Text style={styles.buttonText}>
                {wait ? 'Verifying...' : 'Verify BVN'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </PageView>
  );
};

export default Bvn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container_1: {
    flexGrow: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    padding: 20,
    // backgroundColor: '#f9f9f9',
  },
  loader: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 10,
    borderColor: Colors.pri,
    borderStyle: 'dashed',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: Colors.dark,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#9095A1',
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  hint: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: Colors.pri,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
