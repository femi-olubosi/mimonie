import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { PageView } from '../Reusable';
import { Colors } from '../../constants/Colors';
import { useGlobalContext } from '../../store/StoreContext';
import { updateUserProfile, fetchUserProfile } from '../../api/user.service';
import { router } from 'expo-router';
import { post } from 'aws-amplify/api';
import JobModal from '../modals/JobModal';
import SelfieCamera from './SelfieCamera';

export default function EaseIdKYC() {
  const [ninNumber, setNinNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selfieImage, setSelfieImage] = useState(null);
  const [ninData, setNinData] = useState(null);

  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    status: '',
  });
  const { currentUser, setUserProfile } = useGlobalContext();

  const validateNIN = (nin) => {
    const ninRegex = /^\d{11}$/;
    return ninRegex.test(nin);
  };

  const handleNINVerification = async () => {
    if (!validateNIN(ninNumber)) {
      setModalContent({
        title: 'Invalid NIN',
        message: 'Please enter a valid 11-digit NIN number.',
        status: 'error',
      });
      setStatusModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      const restOperation = post({
        apiName: 'palmpay',
        path: '/easeId',
        options: {
          body: {
            nin: ninNumber,
          },
        },
      });
      const response = await restOperation.response;
      const res = await response.body.json();

      if (res.respCode === '00000000') {
        setNinData(res.data);
        setCurrentStep(2);
      } else {
        let errorMessage = 'NIN verification failed. Please try again.';

        switch (res.respCode) {
          case '99120010':
            errorMessage = 'NIN do not exist';
            break;
          case '99120012':
            errorMessage = 'Parameter error in the interface call.';
            break;
          case '99120013':
            errorMessage = 'System Error.';
            break;
          default:
            errorMessage =
              res.respMsg || 'Verification failed. Please try again.';
        }

        setModalContent({
          title: 'Verification Failed',
          message: errorMessage,
          status: 'error',
        });
        setStatusModalVisible(true);
      }
    } catch (error) {
      console.error('NIN Verification Error:', error);
      setModalContent({
        title: 'Network Error',
        message:
          'Failed to connect to verification service. Please check your internet connection and try again.',
        status: 'error',
      });
      setStatusModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfieCapture = async (base64Image) => {
    setSelfieImage(base64Image);
    setCurrentStep(3);
    await performFaceComparison(base64Image);
  };

  const performFaceComparison = async (selfieBase64) => {
    setLoading(true);

    const payload = {
      sourceImage: ninData.photo,
      targetImage: selfieBase64,
    };

    try {
      const restOperation = post({
        apiName: 'palmpay',
        path: '/easeId/face-compare',
        options: {
          body: payload,
        },
      });
      const response = await restOperation.response;
      const res = await response.body.json();

      if (parseInt(res.data?.similarity) >= 60) {
        await updateUserProfile(
          { verification_in_progress_id: false, is_nin_verified: true },
          currentUser
        );

        await fetchUserProfile(setUserProfile, currentUser);

        setModalContent({
          title: 'Verification Successful!',
          message: 'Your identity has been verified successfully.',
          status: 'success',
        });
      } else {
        setModalContent({
          title: 'Face Match Failed',
          message:
            'The selfie does not match your NIN photo. Please try again with a clearer photo.',
          status: 'error',
        });
      }
    } catch (error) {
      console.error('Face Comparison Error:', error);
      setModalContent({
        title: 'Verification Error',
        message: 'Unable to complete face verification. Please try again.',
        status: 'error',
      });
    } finally {
      setLoading(false);
      setStatusModalVisible(true);
    }
  };

  const closeStatusModal = () => {
    if (modalContent.status === 'success') {
      setStatusModalVisible(false);
      router.push('/(protected)/(tabs)');
    } else {
      setStatusModalVisible(false);
      // Reset to NIN step if failed
      setCurrentStep(1);
      setSelfieImage(null);
      setNinData(null);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      <View style={styles.steps}>
        <View style={[styles.step, currentStep >= 1 && styles.stepActive]}>
          <Text
            style={[styles.stepText, currentStep >= 1 && styles.stepTextActive]}
          >
            1
          </Text>
        </View>
        <View
          style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]}
        />
        <View style={[styles.step, currentStep >= 2 && styles.stepActive]}>
          <Text
            style={[styles.stepText, currentStep >= 2 && styles.stepTextActive]}
          >
            2
          </Text>
        </View>
        <View
          style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]}
        />
        <View style={[styles.step, currentStep >= 3 && styles.stepActive]}>
          <Text
            style={[styles.stepText, currentStep >= 3 && styles.stepTextActive]}
          >
            3
          </Text>
        </View>
      </View>
      <View style={styles.stepLabels}>
        <Text
          style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}
        >
          Enter NIN
        </Text>
        <Text
          style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}
        >
          Take Selfie
        </Text>
        <Text
          style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}
        >
          Verification
        </Text>
      </View>
    </View>
  );

  const renderNINStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.title}>Enter your NIN</Text>
      <Text style={styles.description}>
        Enter your 11-digit National Identity Number to begin the verification
        process
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>National Identity Number (NIN)</Text>
        <TextInput
          style={styles.input}
          value={ninNumber}
          onChangeText={setNinNumber}
          placeholder="Enter 11-digit NIN"
          placeholderTextColor="#999"
          keyboardType="numeric"
          maxLength={11}
          editable={!loading}
        />
        <Text style={styles.hint}>Must be exactly 11 digits</Text>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Important Information</Text>
        <Text style={styles.noteText}>
          • Your NIN will be verified with the National Identity Management
          Commission
        </Text>
        <Text style={styles.noteText}>
          • You'll need to take a selfie for face matching
        </Text>
        <Text style={styles.noteText}>
          • This process is secure and your data is protected
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!ninNumber || ninNumber.length !== 11) && styles.buttonDisabled,
        ]}
        onPress={handleNINVerification}
        disabled={!ninNumber || ninNumber.length !== 11 || loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'VERIFYING...' : 'VERIFY NIN'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelfieStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.title}>Take a Selfie</Text>
      <Text style={styles.description}>
        We need to verify that it's really you. Please take a clear selfie for
        face matching.
      </Text>

      <View style={styles.selfieContainer}>
        <SelfieCamera onCapture={handleSelfieCapture} loading={loading} />
      </View>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Tips for a great selfie:</Text>
        <Text style={styles.tipsText}>
          • Make sure your face is clearly visible
        </Text>
        <Text style={styles.tipsText}>• Good lighting is important</Text>
        <Text style={styles.tipsText}>• Remove sunglasses or hats</Text>
        <Text style={styles.tipsText}>• Look directly at the camera</Text>
      </View>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.processingContent}>
      <View style={styles.loadingContainer}>
        <Text style={styles.emojiLarge}>🔍</Text>
        <Text style={styles.processingTitle}>Verifying Your Identity</Text>
        <Text style={styles.processingText}>
          We're comparing your selfie with your NIN photo...
        </Text>
        <View style={styles.loadingDots}>
          <ActivityIndicator color={Colors.pri} />
        </View>
      </View>
    </View>
  );

  return (
    <PageView
      title="Identity Verification"
      backIcon={!loading && currentStep === 1}
    >
      <View style={styles.container}>
        {renderStepIndicator()}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {currentStep === 1 && renderNINStep()}
          {currentStep === 2 && renderSelfieStep()}
          {currentStep === 3 && renderProcessingStep()}
        </ScrollView>

        {/* Verification Status Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={statusModalVisible}
          onRequestClose={closeStatusModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {modalContent.status === 'success' && (
                <View style={styles.successIcon}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>
              )}
              {modalContent.status === 'error' && (
                <View style={styles.errorIcon}>
                  <Text style={styles.errorIconText}>✕</Text>
                </View>
              )}
              <Text style={styles.modalTitle}>{modalContent.title}</Text>
              <Text style={styles.modalMessage}>{modalContent.message}</Text>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  modalContent.status === 'success' &&
                    styles.modalSuccessButton,
                  modalContent.status === 'error' && styles.modalErrorButton,
                ]}
                onPress={closeStatusModal}
              >
                <Text style={styles.modalButtonText}>
                  {modalContent.status === 'success' ? 'Continue' : 'Try Again'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Loading Modal */}
        <JobModal isLoading={loading} setLoading={setLoading} />
      </View>
    </PageView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: Colors.pri,
  },
  stepText: {
    color: '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepTextActive: {
    color: '#FFF',
  },
  stepLine: {
    width: 90,
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  stepLineActive: {
    backgroundColor: Colors.pri,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  stepLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: Colors.pri,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 38,
    marginBottom: 4,
  },
  emojiLarge: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  noteCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 25,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: Colors.pri,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selfieContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  processingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  processingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.pri,
    marginHorizontal: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorIconText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1F2937',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalSuccessButton: {
    backgroundColor: Colors.pri,
  },
  modalErrorButton: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
