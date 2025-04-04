import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import PinInput from '../PinInput';
import { sendOtp, verifyOTP } from '../../api/token.service';
import { fetchUserProfile, updateUserProfile } from '../../api/user.service';

const PinInputModal = ({
  visible,
  onClose,
  userProfile,
  setUserProfile,
  currentUser,
}) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [pinRef, setPinRef] = useState(null);
  const [userPin, setUserPin] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const handleConfirmPin = async () => {
    const pinString = pin.join('');
    if (pinString.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pin');
      return;
    }

    setVerifying(true);
    try {
      if (pinRef) {
        const res = await verifyOTP(pinRef.pinId, pinString);
        if (res.verified) {
          setUserProfile((prev) => ({ ...prev, transfer_pin: userPin }));
          await updateUserProfile({ transfer_pin: userPin }, currentUser);
          await fetchUserProfile(setUserProfile, currentUser);
          setVerifying(false);
          onClose();

          Alert.alert('Pin Created Successfully', 'Initiate your Transfer');
        }
      } else {
        setUserPin(pinString);
        const res = await sendOtp(userProfile.phone_number);
        setPinRef(res);
      }
    } catch (e) {
      Alert.alert('Error', e.message + '');
    } finally {
      setPin(['', '', '', '', '', '']);
      setVerifying(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {pinRef ? 'Enter Code' : 'Create Transfer Pin'}
            </Text>
            <Text
              style={{ marginVertical: 10, fontFamily: 'ir', fontSize: 10 }}
            >
              {pinRef
                ? 'Enter the code sent to your registered phone number'
                : ' A code will be sent to your registered phone number for verification'}
            </Text>
            <View style={{ rowGap: 14, width: '100%' }}>
              <Text style={styles.label}>Enter your 6 digit pin</Text>
              <PinInput pin={pin} setPin={setPin} />
              {pinRef ? null : (
                <Text style={{ marginTop: 10, fontFamily: 'ir', fontSize: 10 }}>
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
                onPress={onClose}
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
  );
};

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

export default PinInputModal;
