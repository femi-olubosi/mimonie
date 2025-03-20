import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

const ConfirmJoinModal = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Terms and Conditions</Text>
          <Text style={styles.modalSubtitle}>
            By joining this contribution, you agree to the following:
          </Text>

          <View style={styles.conditionsContainer}>
            <Text style={styles.condition}>
              1. Your payment method must be funded before the deduction date.
            </Text>
            <Text style={styles.condition}>
              2. Deductions will occur every Monday.
            </Text>
            <Text style={styles.condition}>
              3. You are responsible for applicable transaction fees and
              administrative charges.
            </Text>
            <Text style={styles.condition}>
              4. The contribution organizer will receive a percentage of the
              total contributions at the end of the cycle.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.buttonText}>Agree and Join</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  conditionsContainer: {
    marginBottom: 20,
  },
  condition: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfirmJoinModal;
