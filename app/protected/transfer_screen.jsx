import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useGlobalContext } from '@/store/StoreContext';
import { PageView } from '@/components/Reusable';
import { Colors } from '@/constants/Colors';
import {
  deleteBankDetails,
  fetchBankDetails,
  updateBankDetails,
  withdrawFunds,
} from '../../api/payment.service';
import Banks from '../../components/withdrawal/Banks';
import AddBankModal from '../../components/withdrawal/AddBankModal';
import PinInputModal from '../../components/withdrawal/PinInputModal';
import ValidateUser from '../../components/withdrawal/ValidateUser';
import { ErrorCheck } from '../../utils/errorCheck';
import WithdrawalLoader from '../../components/withdrawal/WithrawalLoader';

const transfer_screen = () => {
  const { contribution, isEarly, participant } = useLocalSearchParams();
  const { userProfile, setUserProfile, setIsLoading, currentUser } =
    useGlobalContext();
  const [bankDetails, setBankDetails] = useState([]);
  const [addBankModal, setAddBankModal] = useState(false);
  const parsedContribution = JSON.parse(contribution);
  const parsedParticipant = JSON.parse(participant);
  const [createPinModal, setCreatePinModal] = useState(false);
  const [validateCustomerModal, setValidateCustomerModal] = useState(false);
  const [amountToWithdraw, setAmountToWithdraw] = useState('');
  const isEarlyWithdrawal = isEarly === 'false' ? false : true;
  const [recipientCode, setRecipientCode] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBankDetails(setBankDetails, currentUser);
  }, []);

  useEffect(() => {
    const active = bankDetails.find((e) => e.status === 'active');
    if (active) {
      setRecipientCode(active?.index);
    }
  }, [bankDetails]);

  const balance = parsedParticipant?.balance;
  const penalty = balance * 0.1;
  const newBalance = balance - penalty;

  const handleWithdrawFund = async () => {
    const amount = isEarlyWithdrawal ? balance : amountToWithdraw;

    if (ErrorCheck({ amount })) {
      return;
    }

    if (Number(amount) > Number(balance)) {
      Alert.alert('Insufficient Balance', 'Insufficient balance to withdraw');
      return;
    }

    if (userProfile.transfer_pin) {
      setValidateCustomerModal(true);
    } else {
      setCreatePinModal(true);
    }
  };

  const onVerified = async () => {
    setValidateCustomerModal(false);
    setProcessing(true);
    try {
      const amount = isEarlyWithdrawal ? balance : amountToWithdraw;

      const withdrawalResponse = await withdrawFunds(
        userProfile,
        parsedContribution?.id,
        amount,
        recipientCode
      );

      if (withdrawalResponse?.success) {
        setIsLoading(false);
        setProcessing(false);
        Alert.alert(
          'Withdrawal Processed',
          'Your withdrawal request has been successfully processed',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push(`/protected/mimonie`);
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        setIsLoading(false);
        setProcessing(false);
        Alert.alert(
          'Withdrawal Failed',
          `${withdrawalResponse?.message || 'Unknown error occurred'}`
        );
      }
    } catch (error) {
      setIsLoading(false);
      setProcessing(false);
      Alert.alert(
        'Error',
        `${error?.message || 'An unexpected error occurred, please try again.'}`
      );
    } finally {
      setIsLoading(false);
      setProcessing(false);
    }
  };

  const onAddBankCompleted = (bank) => {
    setBankDetails((prev) => [...prev, bank]);
    fetchBankDetails(setBankDetails, currentUser);
    setAddBankModal(false);
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
    setRecipientCode(item.index);
    try {
      await updateBankDetails(item.id, userProfile);
      await fetchBankDetails(setBankDetails, currentUser);
    } catch (e) {
      console.error('error updating bank details', e);
    }
  };

  return (
    <>
      <PageView
        title={'Fund Withdraw'}
        route={`/protected/mimonie/${parsedContribution?.id}`}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <Banks
            bankDetails={bankDetails}
            handleDeleteCard={handleDeleteCard}
            handleSelectCard={handleSelectCard}
            setAddBankModal={setAddBankModal}
          />
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ marginTop: 20 }}>
              <View
                style={{ alignItems: 'flex-end', rowGap: 4, marginBottom: 5 }}
              >
                <Text>Balance: (NGN) {balance}</Text>
                {isEarlyWithdrawal ? (
                  <>
                    <Text>Withdrawable Balance: (NGN) {newBalance}</Text>
                    <Text style={{ fontSize: 10 }}>
                      10% early withdrawal charge
                    </Text>
                  </>
                ) : (
                  <Text>Withdrawable Balance: (NGN) {balance}</Text>
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
        <AddBankModal
          onCompleted={onAddBankCompleted}
          bankDetails={bankDetails}
          addBankModal={addBankModal}
          setAddBankModal={setAddBankModal}
          userProfile={userProfile}
        />

        <ValidateUser
          visible={validateCustomerModal}
          onClose={() => setValidateCustomerModal(false)}
          userProfile={userProfile}
          onVerified={onVerified}
        />
        <PinInputModal
          setUserProfile={setUserProfile}
          userProfile={userProfile}
          visible={createPinModal}
          onClose={() => setCreatePinModal(false)}
          currentUser={currentUser}
        />
      </PageView>
      <WithdrawalLoader isLoading={processing} />
    </>
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
