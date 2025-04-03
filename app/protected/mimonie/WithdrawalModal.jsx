import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { earlyWithdrawalCharge } from '../../../constants/charges';

const WithdrawalModal = ({
  visible,
  onClose,
  onConfirm,
  balance,
  isEarlyWithdrawal = false,
}) => {
  const withdrawableAmount = isEarlyWithdrawal
    ? balance - balance * (earlyWithdrawalCharge / 100)
    : balance;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Request Withdrawal</Text>

          <Text style={styles.infoText}>
            Withdrawal will take 24 hours to be processed.
          </Text>

          {isEarlyWithdrawal && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Early withdrawal penalty: 10% fee applied
              </Text>
            </View>
          )}

          <View style={styles.amountContainer}>
            <Text style={styles.label}>Withdrawable Amount:</Text>
            <Text style={styles.amountText}>
              ₦{withdrawableAmount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#006EBD',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
  },
  amountContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  amountText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#006EBD',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#555',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F', // Red error color
    marginTop: 4,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#006EBD', // Using Colors.pri
    opacity: 1,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default WithdrawalModal;
