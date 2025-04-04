import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { isEarly, toDays } from '../../../utils/isEarlyWithdrawal';

const StopSavingsModal = ({
  visible,
  onClose,
  onConfirm,
  breakFeePercentage = 10,
  contribution,
  isLoading,
}) => {
  const variant = contribution?.variant?.toLowerCase(); // Ensure lowercase
  const totalDuration = contribution?.num_of_month;
  const currentProgress = contribution?.currently_at || 0;

  // Calculate if early using the new method
  const earlyWithdrawal = isEarly(currentProgress, totalDuration, variant);

  // Calculate break fee only if early
  const breakFeeAmount = earlyWithdrawal
    ? (breakFeePercentage / 100) * (contribution?.amount * currentProgress)
    : 0;

  // Convert progress to days for accurate percentage calculation
  const currentInDays = toDays(variant, currentProgress);
  const totalInDays = toDays(variant, totalDuration);
  const completionPercentage = Math.round((currentInDays / totalInDays) * 100);

  // Format display text based on variant
  const getVariantDisplay = () => {
    switch (variant) {
      case 'days':
        return 'day(s)';
      case 'weeks':
        return 'week(s)';
      case 'months':
        return 'month(s)';
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Stop Savings Confirmation</Text>

          <View style={styles.contentContainer}>
            <Text style={styles.modalText}>
              Are you sure you want to stop this savings plan?
            </Text>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Your progress: {currentProgress} of {totalDuration}{' '}
                {getVariantDisplay()} ({completionPercentage}%)
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${completionPercentage}%` },
                  ]}
                />
              </View>
            </View>

            {earlyWithdrawal && (
              <View style={styles.feeWarning}>
                <Text style={styles.feeText}>
                  ⚠️ Early termination fee: {breakFeePercentage}% (₦
                  {breakFeeAmount.toFixed(2)})
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Continue Saving</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              <Text style={styles.confirmButtonText}>
                {isLoading ? 'Processing...' : 'Stop Savings'}
              </Text>
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
    color: 'black',
    marginBottom: 16,
    textAlign: 'center',
  },
  contentContainer: {
    marginVertical: 12,
  },
  modalText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: Colors.pri,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#CCCCCC',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'green',
  },
  feeWarning: {
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  feeText: {
    fontSize: 14,
    color: Colors.pri,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 6,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: Colors.pri,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: 'red',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default StopSavingsModal;
