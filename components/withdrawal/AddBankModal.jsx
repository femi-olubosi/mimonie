import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SelectInput } from '../Reusable';
import {
  createBankDetails,
  createTransferRecipientForBank,
  fetchBanks,
  resolveBankAccount,
} from '../../api/payment.service';
import { Colors } from '../../constants/Colors';

const AddBankModal = ({
  addBankModal,
  setAddBankModal,
  onCompleted,
  bankDetails,
  userProfile,
}) => {
  const [banks, setBanks] = useState([]);
  const [selectedValue, setSelectedValue] = useState({});
  const [accountNumber, setAccountNumber] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    (async () => {
      const banksList = await fetchBanks();
      setBanks(banksList);
    })();
  }, []);

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

        setAccountNumber('');
        setSelectedValue({});
        onCompleted(bank);
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

  return (
    <Modal visible={addBankModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Bank Account</Text>

            <View style={{ rowGap: 14, width: '100%' }}>
              <View style={{ width: '100%' }}>
                <Text style={styles.label}>Bank Name</Text>
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
                account list. Ensure the account belongs to you and the account
                name matches with your app name
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
  );
};

export default AddBankModal;

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
