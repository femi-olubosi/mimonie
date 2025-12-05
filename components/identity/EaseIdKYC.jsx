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
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_TRIES = 30;
export default function EaseIdKYC() {
  const [ninNumber, setNinNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selfieImage, setSelfieImage] = useState(null);
  const [ninData, setNinData] = useState(null);
  const [loadingSavedData, setLoadingSavedData] = useState(true);
  const [nameMismatchCount, setNameMismatchCount] = useState(0);

  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    status: '',
  });
  const { currentUser, setUserProfile, userProfile } = useGlobalContext();

  useEffect(() => {
    loadSavedNINData();
    loadNameMismatchCount();
  }, []);

  const loadSavedNINData = async () => {
    try {
      const savedNinData = await AsyncStorage.getItem('ninVerificationData');
      if (savedNinData) {
        const parsedData = JSON.parse(savedNinData);
        setNinData(parsedData);
        setNinNumber(parsedData.nin);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error loading saved NIN data:', error);
    } finally {
      setLoadingSavedData(false);
    }
  };

  const loadNameMismatchCount = async () => {
    try {
      const count = await AsyncStorage.getItem('nameMismatchCount');
      if (count) {
        setNameMismatchCount(parseInt(count));
      }
    } catch (error) {
      console.error('Error loading name mismatch count:', error);
    }
  };

  const saveNameMismatchCount = async (count) => {
    try {
      await AsyncStorage.setItem('nameMismatchCount', count.toString());
    } catch (error) {
      console.error('Error saving name mismatch count:', error);
    }
  };

  const clearNameMismatchCount = async () => {
    try {
      await AsyncStorage.removeItem('nameMismatchCount');
    } catch (error) {
      console.error('Error clearing name mismatch count:', error);
    }
  };

  const saveNINData = async (data) => {
    try {
      await AsyncStorage.setItem('ninVerificationData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving NIN data:', error);
    }
  };

  const clearNINData = async () => {
    try {
      await AsyncStorage.removeItem('ninVerificationData');
    } catch (error) {
      console.error('Error clearing NIN data:', error);
    }
  };

  const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;

    const cleanStr1 = str1.toLowerCase().replace(/[^a-z]/g, '');
    const cleanStr2 = str2.toLowerCase().replace(/[^a-z]/g, '');

    if (cleanStr1 === cleanStr2) return 100;

    const set1 = new Set(cleanStr1);
    const set2 = new Set(cleanStr2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return (intersection.size / union.size) * 100;
  };

  const compareNamesWithNIN = (ninResponse) => {
    if (!userProfile?.name) return false;

    const userNames = userProfile.name.split(' ');
    const userFirstName = userNames[0] || '';
    const userLastName = userNames[1] || userNames[0] || '';

    const ninFirstName = ninResponse.firstName || '';
    const ninLastName = ninResponse.surname || '';

    const firstNameSimilarity = calculateSimilarity(
      userFirstName,
      ninFirstName
    );
    const lastNameSimilarity = calculateSimilarity(userLastName, ninLastName);

    console.log('Name comparison:', {
      userFirstName,
      ninFirstName,
      firstNameSimilarity,
      userLastName,
      ninLastName,
      lastNameSimilarity,
    });

    return firstNameSimilarity >= 80 && lastNameSimilarity >= 80;
  };

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

    if (nameMismatchCount >= MAX_TRIES) {
      setModalContent({
        title: 'Maximum Attempts Reached',
        message:
          'You have exceeded the maximum number of attempts for name verification. Please contact support for assistance.',
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
        const namesMatch = compareNamesWithNIN(res.data);

        if (!namesMatch) {
          const newCount = nameMismatchCount + 1;
          setNameMismatchCount(newCount);
          await saveNameMismatchCount(newCount);

          if (newCount >= MAX_TRIES) {
            setModalContent({
              title: 'Name Verification Failed',
              message:
                'The name on your NIN does not match your profile information. You have reached the maximum number of attempts. Please contact support.',
              status: 'error',
              route: '(protected)/account',
            });
          } else {
            setModalContent({
              title: 'Name Mismatch',
              message: `The name on your NIN does not match your profile information. Please ensure you're using your correct NIN. Attempts remaining: ${
                MAX_TRIES - newCount
              }`,
              status: 'error',
            });
          }
          setCurrentStep(1);
          setStatusModalVisible(true);
          return;
        }

        const ninDataToSave = {
          ...res.data,
          nin: ninNumber,
          verifiedAt: new Date().toISOString(),
        };
        setNinData(ninDataToSave);
        await saveNINData(ninDataToSave);

        await clearNameMismatchCount();
        setNameMismatchCount(0);

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
        await clearNINData();
        await clearNameMismatchCount();

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
    // if (nameMismatchCount >= MAX_TRIES) {
    //   setStatusModalVisible(false);
    //   router.push('/(protected)/(tabs)');
    // }
    if (modalContent.status === 'success') {
      setStatusModalVisible(false);
      router.push('/(protected)/(tabs)');
    } else {
      setStatusModalVisible(false);

      if (
        modalContent.title === 'Name Mismatch' ||
        modalContent.title === 'Name Verification Failed' ||
        modalContent.title === 'Network Error' ||
        modalContent.title === 'Verification Failed'
      ) {
        setCurrentStep(1);
      } else {
        setSelfieImage(null);
        setCurrentStep(2);
      }
    }
  };

  const handleResetNIN = async () => {
    await clearNINData();
    setNinData(null);
    setNinNumber('');
    setSelfieImage(null);
    setCurrentStep(1);
  };

  const renderNINStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.title}>Enter your NIN</Text>
      <Text style={styles.description}>
        Enter your 11-digit National Identity Number to begin the verification
        process
      </Text>

      {nameMismatchCount > 0 && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Name Verification Required</Text>
          <Text style={styles.warningText}>
            Attempts remaining: {MAX_TRIES - nameMismatchCount}
          </Text>
          <Text style={styles.warningText}>
            Ensure the NIN belongs to you and matches your profile name:{' '}
            {userProfile?.name}
          </Text>
        </View>
      )}

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
          editable={!loading && nameMismatchCount < MAX_TRIES}
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
          • The name on your NIN must match your profile information
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
          (!ninNumber ||
            ninNumber.length !== 11 ||
            nameMismatchCount >= MAX_TRIES) &&
            styles.buttonDisabled,
        ]}
        onPress={handleNINVerification}
        disabled={
          !ninNumber ||
          ninNumber.length !== 11 ||
          loading ||
          nameMismatchCount >= MAX_TRIES
        }
      >
        <Text style={styles.primaryButtonText}>
          {nameMismatchCount >= MAX_TRIES
            ? 'MAX ATTEMPTS REACHED'
            : loading
            ? 'VERIFYING...'
            : 'VERIFY NIN'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelfieStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.headerSection}>
        <Text style={styles.verifiedNin}>Verified NIN: {ninData?.nin}</Text>
      </View>

      <Text style={styles.description}>
        We need to verify that it's really you. Please take a clear selfie for
        face matching with your verified NIN.
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
        {loadingSavedData ? (
          <ActivityIndicator color={Colors.pri} />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {currentStep === 1 && renderNINStep()}
            {currentStep === 2 && renderSelfieStep()}
            {currentStep === 3 && renderProcessingStep()}
          </ScrollView>
        )}

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
  stepContent: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  verifiedNin: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 8,
  },
  warningCard: {
    backgroundColor: '#FEF3F2',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECDCA',
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D92D20',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#D92D20',
    marginBottom: 4,
    lineHeight: 18,
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
  supportButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  supportButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  selfieContainer: {
    height: 500,
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
  emojiLarge: {
    fontSize: 64,
    marginBottom: 20,
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
