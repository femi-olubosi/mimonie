import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../../constants/Colors';

const StartSavingsModal = ({
  visible,
  onClose,
  onConfirm,
  processingCharge = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {processingCharge ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.pri} />
              <Text style={styles.loaderText}>Processing your payment...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.modalTitle}>Start Personal Savings</Text>

              <View style={styles.contentContainer}>
                <Text style={styles.modalText}>
                  You're about to start this savings plan. We will charge your
                  card immediately with the amount of your savings.
                </Text>

                <Text style={styles.modalText}>
                  Please ensure your card is active and funded. Savings will not
                  be started if we cannot charge you for the first contribution.
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
            </>
          )}
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
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loaderText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.pri,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  contentContainer: {
    marginVertical: 10,
  },
  modalText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 15,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
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
    backgroundColor: Colors.pri,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default StartSavingsModal;
