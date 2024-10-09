import {
  Alert,
  Button,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  Picker,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useGlobalContext } from '@/store/StoreContext';
import { PageView } from '@/components/Reusable';
import { Colors } from '@/constants/Colors';
import { getBankLogo } from '@/utils/bankLogo';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import {
  createBankDetails,
  createTransferRecipientForBank,
  deleteBankDetails,
  fetchBankDetails,
  fetchBanks,
  resolveBankAccount,
  updateBankDetails,
  withdrawFunds,
} from '../../api/payment.service';
import { SelectInput } from '@/components/Reusable';
import { ErrorCheck } from '@/utils/errorCheck';
import { sendOtp, verifyOTP } from '../../api/token.service';

const transfer_screen = () => {
  const { contribution, isEarly, participant } = useLocalSearchParams();
  const {
    userProfile,
    setUserProfile,
    setIsLoading,
    setContributions,
    currentUser,
  } = useGlobalContext();
  const [bankDetails, setBankDetails] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedValue, setSelectedValue] = useState({});
  const [accountNumber, setAccountNumber] = useState('');
  const [addBankModal, setAddBankModal] = useState(false);
  const parsedContribution = JSON.parse(contribution);
  const parsedParticipant = JSON.parse(participant);
  const [verifying, setVerifying] = useState(false);
  const [createPinModal, setCreatePinModal] = useState(false);
  const [validateCustomerModal, setValidateCustomerModal] = useState(false);
  const [amountToWithdraw, setAmountToWithdraw] = useState('');
  const isEarlyWithdrawal = isEarly === 'false' ? false : true;
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [pinRef, setPinRef] = useState(null);

  const pinRefs = useRef([]);

  const handlePinChange = (value, index) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      pinRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && pin[index] === '' && index > 0) {
      // Move focus to the previous input if deleting
      pinRefs.current[index - 1].focus();
    }
  };

  useEffect(() => {
    (async () => {
      const banksList = await fetchBanks();
      setBanks(banksList);
    })();
  }, []);

  useEffect(() => {
    fetchBankDetails(setBankDetails, currentUser);
  }, []);

  const balance = parsedParticipant?.contributions * parsedContribution?.amount;
  const penalty = balance * 0.1;
  const newBalance = balance - penalty;

  const handleWithdrawFund = async () => {
    const amount = isEarlyWithdrawal ? balance : amountToWithdraw;

    if (ErrorCheck({ amount })) {
      return;
    }

    if (amount > (parsedParticipant?.balance || balance)) {
      Alert.alert('Insufficient Balance', 'Insufficient balance to withdraw');
      return;
    }

    if (userProfile.transfer_pin) {
      setValidateCustomerModal(true);
    } else {
      setCreatePinModal(true);
    }
  };

  const isUser = async () => {
    const pinString = pin.join('');
    if (pinString.length < 6) {
      Alert.alert('Invalid PIN', 'Please enter a valid 6-digit PIN');
      return false;
    }

    if (pinString !== userProfile.transfer_pin) {
      Alert.alert('Invalid PIN', 'Incorrect PIN');
      return false;
    }

    try {
      setIsLoading(true);
      const withdrawalResponse = await withdrawFunds(
        userProfile,
        parsedContribution?.id,
        amount
      );

      if (withdrawalResponse?.status === 'success') {
        Alert.alert(
          'Withdrawal Processed',
          'Your withdrawal request has been processed'
        );
        setIsLoading(false);
      } else {
        Alert.alert('Withdrawal Failed', `${withdrawalResponse.message}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      Alert.alert('Error', error.message);
    } finally {
      setPin(['', '', '', '', '', '']);
      setIsLoading(false);
    }
  };

  const handleAddBank = async () => {
    if (bankDetails.some((e) => e.bank_number === accountNumber)) {
      Alert.alert('Error', 'Bank Account already exists');
      return;
    }

    setVerifying(true);
    try {
      const res = await resolveBankAccount(
        accountNumber,
        selectedValue.value,
        userProfile
      );

      if (res.success) {
        const recipient_code = await createTransferRecipientForBank({
          bank_code: selectedValue.value,
          account_number: accountNumber,
          account_name: userProfile.name,
        });
        const bank = await createBankDetails(
          {
            account_number: accountNumber,
            bank_code: selectedValue.value,
            bank_name: selectedValue.label,
            recipient_code: recipient_code,
            status: bankDetails?.length < 1 ? 'active' : 'inactive',
          },
          userProfile
        );

        setBankDetails((prev) => [...prev, bank]);
        fetchBankDetails(setBankDetails, currentUser);
        setAddBankModal(false);
        setAccountNumber('');
        setSelectedValue({});
      } else {
        Alert.alert('Verification failed', res.message);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', e.message + '');
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteCard = async () => {
    setBankDetails((prev) =>
      item.id === prev.id ? { ...item, status: 'active' } : prev
    );

    try {
      await deleteBankDetails(item.id);
    } catch (e) {
      console.error('Error', e);
    }
  };

  const handleSelectCard = async (item) => {
    setBankDetails((prev) =>
      item.id === prev.id ? { ...item, status: 'active' } : prev
    );

    try {
      await updateBankDetails(item.id, userProfile);
      await fetchBankDetails(setBankDetails, currentUser);
    } catch (e) {
      console.error('error updating bank details', e);
    }
  };

  const handleConfirmPin = async () => {
    const pinString = pin.join('');
    if (pinString.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pin');
      return;
    }

    setVerifying(true);

    Alert.alert('Not available', 'Feature not available at the moment');
    setVerifying(false);
    return;
    try {
      if (pinRef) {
        const res = await verifyOTP(pinRef.pinId, pinString);
        if (res.verified === 'True') {
          setCreatePinModal(false);
          setUserProfile((prev) => ({ ...prev, transfer_pin: pinString }));
          await isUser();
        }
      } else {
        const res = await sendOtp(userProfile.phone_number);
        setPinRef(res);
      }
    } catch (e) {
      console.error(e.message);
      Alert.alert('Error', e.message + '');
    } finally {
      setPin(['', '', '', '', '', '']);
      setVerifying(false);
    }
  };

  const renderBanks = (item) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: 'gray',
          paddingVertical: 5,
        }}
        key={item.id}
        onPress={() => handleSelectCard(item)}
      >
        <View
          style={{ flexDirection: 'row', columnGap: 10, alignItems: 'center' }}
        >
          <View style={{ width: 20 }}>
            {item.status === 'active' && (
              <AntDesign name="check" size={22} color={Colors.pri} />
            )}
          </View>
          <Image
            source={getBankLogo(item.bank_name)}
            style={{
              width: 40,
              height: 40,
              objectFit: 'contain',
            }}
          />
          <View style={{ rowGap: 5, marginLeft: 10 }}>
            <Text style={{ fontSize: 14, fontFamily: 'ir' }}>
              {item.bank_name}
            </Text>

            <Text style={{ fontSize: 12 }}>{item.bank_number}</Text>
          </View>
        </View>
        <FontAwesome
          name="trash"
          size={24}
          color="red"
          onPress={() => {
            Alert.alert(
              'Delete Bank Account',
              'Are you sure you want to delete this bank account?',
              [
                {
                  text: 'Yes',
                  onPress: () => handleDeleteCard(item),
                  style: 'destructive',
                },
                { text: 'No', style: 'cancel' },
              ]
            );
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <PageView
      title={'Fund Withdraw'}
      route={`/protected/mimonie/${parsedContribution?.id}`}
    >
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ minHeight: '20%', width: '100%' }}>
          {bankDetails.length > 0 ? (
            bankDetails.map((item) => {
              return renderBanks(item);
            })
          ) : (
            <Text style={{ textAlign: 'center' }}>
              You dont have any account to transfer to
            </Text>
          )}
        </View>
        <Button
          title="Add Bank Account"
          onPress={() => setAddBankModal(true)}
          color={Colors.pri}
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ marginTop: 20 }}>
            <View
              style={{ alignItems: 'flex-end', rowGap: 4, marginBottom: 5 }}
            >
              <Text>
                Balance: (NGN) {parsedParticipant?.balance || balance}
              </Text>
              {isEarlyWithdrawal ? (
                <>
                  <Text>Withdrawable Balance: (NGN) {newBalance}</Text>
                  <Text style={{ fontSize: 10 }}>
                    10% early withdrawal charge
                  </Text>
                </>
              ) : (
                <Text>
                  Withdrawable Balance: (NGN){' '}
                  {parsedParticipant?.balance || balance}
                </Text>
              )}
            </View>
            {!isEarlyWithdrawal && (
              <TextInput
                style={styles.input}
                placeholder="Enter Amount to withdraw"
                value={amountToWithdraw}
                onChangeText={setAmountToWithdraw}
                keyboardType="number-pad"
              />
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={handleWithdrawFund}
            >
              <Text style={styles.buttonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <Modal visible={addBankModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add Bank Account</Text>

              <View style={{ rowGap: 14, width: '100%' }}>
                <View style={{ width: '100%' }}>
                  <Text style={styles.label}>Account Number</Text>
                  <SelectInput
                    options={banks}
                    selectedValue={selectedValue}
                    setSelectedValue={setSelectedValue}
                    defaultValue={selectedValue?.label}
                  />
                </View>

                <View style={{ width: '100%' }}>
                  <Text style={styles.label}>Account Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={{ marginTop: 10, fontFamily: 'ir', fontSize: 10 }}>
                  Note that we will verify the account before adding it to your
                  account list. Ensure the account belongs to you and the
                  account name matches with your app name
                </Text>
              </View>
              {verifying && (
                <View style={{ marginTop: 10 }}>
                  <ActivityIndicator size="small" color={Colors.pri} />
                  <Text style={{ marginTop: 5, fontFamily: 'ir' }}>
                    Verifying account...
                  </Text>
                </View>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setAddBankModal(false)}
                  disabled={verifying}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAddBank}
                  disabled={verifying}
                >
                  <Text style={styles.modalButtonText}>Add Bank</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
      <Modal visible={validateCustomerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Input Transfer Pin</Text>

              <View style={{ width: '100%' }}>
                <Text style={styles.label}>Enter your 6 digit pin</Text>
                <View style={styles.pinContainer}>
                  {pin.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={styles.pinInput}
                      value={digit}
                      onChangeText={(value) => handlePinChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      ref={(ref) => (pinRefs.current[index] = ref)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      secureTextEntry
                    />
                  ))}
                </View>
              </View>

              {verifying && (
                <View style={{ marginTop: 10 }}>
                  <ActivityIndicator size="small" color={Colors.pri} />
                  <Text style={{ marginTop: 5, fontFamily: 'ir' }}>
                    Verifying account...
                  </Text>
                </View>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setValidateCustomerModal(false)}
                  disabled={verifying}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={isUser}
                  disabled={verifying}
                >
                  <Text style={styles.modalButtonText}>Enter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
      <Modal visible={createPinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Create Transfer Pin</Text>
              <Text
                style={{ marginVertical: 10, fontFamily: 'ir', fontSize: 10 }}
              >
                {pinRef
                  ? 'Enter the code sent to your registered phone number'
                  : ' A code will be sent to your registered phone number for verification'}
              </Text>
              <View style={{ rowGap: 14, width: '100%' }}>
                <Text style={styles.label}>Enter your 6 digit pin</Text>
                <View style={styles.pinContainer}>
                  {pin.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={styles.pinInput}
                      value={digit}
                      onChangeText={(value) => handlePinChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      ref={(ref) => (pinRefs.current[index] = ref)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      onPress={Keyboard.dismiss}
                    />
                  ))}
                </View>
                {pinRef ? null : (
                  <Text
                    style={{ marginTop: 10, fontFamily: 'ir', fontSize: 10 }}
                  >
                    This pin will be use for all your transfers. Please keep it
                    safe and secured
                  </Text>
                )}
              </View>
              {verifying && (
                <View style={{ marginTop: 10 }}>
                  <ActivityIndicator size="small" color={Colors.pri} />
                  <Text style={{ marginTop: 5, fontFamily: 'ir' }}>
                    Verifying account...
                  </Text>
                </View>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setCreatePinModal(false)}
                  disabled={verifying}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmPin}
                  disabled={verifying}
                >
                  <Text style={styles.modalButtonText}>Create Pin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </PageView>
  );
};

export default transfer_screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listContent: {
    paddingBottom: 20,
    backgroundColor: 'red',
  },
  label: {
    fontSize: 15,
    color: '#1F2937',
    fontFamily: 'ir',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9095A1',
    padding: 12,
    height: 53,
    width: '100%',
  },
  contributionContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    rowGap: 10,
  },
  contributionName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  contributionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contributionAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  contributionStatus: {
    fontSize: 14,
    color: 'white',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: Colors.pri,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    // alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    rowGap: 24,
    minHeight: '60%',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 20,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: Colors.pri,
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: 50,
    height: 50,
    fontSize: 24,
    textAlign: 'center',
  },
});
