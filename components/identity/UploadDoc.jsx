import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PageView } from '../Reusable';
import { Colors } from '../../constants/Colors';
import Loader from '../Loader';
import { useGlobalContext } from '../../store/StoreContext';
import { post } from 'aws-amplify/api';
import { fetchUserProfile, updateUserProfile } from '../../api/user.service';
import { fetchBanks } from '../../api/payment.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import SelectModal from '../modals/SelectModal';
import JobModal from '../modals/JobModal';

export default function UploadDocument() {
  const [documentType, setDocumentType] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [docImage, setDocImage] = useState(null);
  const [idNumber, setIdNumber] = useState(null);
  const [docTypeModalVisible, setDocTypeModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const { kycForm, userProfile, currentUser, setUserProfile } =
    useGlobalContext();

  const handleImageUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setModalContent({
        title: 'Permission Denied',
        message: 'You need to enable permissions to upload an image.',
        status: 'error',
      });
      setStatusModalVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setDocImage(result.assets[0].base64);
    }
  };

  const handleImageCapture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      setModalContent({
        title: 'Permission Denied',
        message: 'You need to enable permissions to use the camera.',
        status: 'error',
      });
      setStatusModalVisible(true);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      base64: true,
      quality: 0.1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setDocImage(result.assets[0].base64);
    }
  };

  const handleFinish = async () => {
    const trial = (await AsyncStorage.getItem('trials')) || 0;

    if (parseInt(trial) >= 3) {
      setModalContent({
        title: 'Maximum Trials Reached',
        message:
          'You have exceeded the maximum number of trials. Please contact our support team at <a href="https://support.mimonie.net" target="_blank">support.mimonie.net</a> for further assistance.',
        status: 'error',
      });
      setStatusModalVisible(true);
      return;
    }

    const check = ['PASSPORT', 'DRIVERS_LICENSE'].includes(documentType.value);
    if (!documentType?.value) {
      setModalContent({
        title: 'Incomplete Information',
        message: 'Please select a document type',
        status: 'error',
      });
      setStatusModalVisible(true);
      return;
    }

    if (!check && !idNumber) {
      setModalContent({
        title: 'Incomplete Information',
        message: 'Please enter your ID number.',
        status: 'error',
      });
      setStatusModalVisible(true);
      return;
    }

    if (check && !docImage) {
      setModalContent({
        title: 'Incomplete Information',
        message: 'Please upload an image',
        status: 'error',
      });
      setStatusModalVisible(true);
      return;
    }

    if (documentType.value === 'VOTER_ID' && idNumber.length !== 19) {
      setModalContent({
        title: 'Invalid ID Number',
        message: 'Please enter a valid 19-digit Voter ID number.',
        status: 'error',
      });
      setStatusModalVisible(true);
      return;
    }

    if (documentType.value === 'NIN_SLIP' && idNumber.length !== 11) {
      setModalContent({
        title: 'Invalid ID Number',
        message: 'Please enter a valid 11-digit NIN number.',
        status: 'error',
      });
      setStatusModalVisible(true);
      return;
    }

    const dVData = {
      id_type: documentType.value,
      user_id: userProfile?.id,
      selfie_image: kycForm?.selfie,
      doc_image: docImage,
    };

    const basicData = {
      id_type: documentType.value,
      id_number: idNumber,
      first_name: userProfile?.name?.split(' ')[0],
      last_name: userProfile?.name?.split(' ')[1],
      dob: userProfile?.birthdate,
      phone_number: userProfile?.phone_number,
      user_id: userProfile?.id,
    };

    const payload = check ? dVData : basicData;
    const path = check
      ? '/biometric-verification'
      : '/biometric-verification/basic';

    console.log(payload, path);
    setLoading(true);
    try {
      const restOperation = post({
        apiName: 'callback',
        path,
        options: {
          body: payload,
        },
      });
      const response = await restOperation.response;
      const res = await response.body.json();

      if (res.result === 'approved') {
        await AsyncStorage.setItem('jobId', res.job_id);
        await updateUserProfile(
          { verification_in_progress_id: false, is_nin_verified: true },
          currentUser
        );

        await fetchUserProfile(setUserProfile, currentUser);
        setLoading(false);
        setModalContent({
          title: 'Verification Successful',
          message: 'Your verification has been approved.',
          status: 'success',
        });
        // router.push('/(protected)/completed_screen');
      } else if (res.result === 'rejected') {
        await updateUserProfile(
          { verification_in_progress_id: false, is_nin_verified: false },
          currentUser
        );
        setLoading(false);
        setModalContent({
          title: 'Verification Rejected',
          message: 'Your verification was rejected. Please try again.',
          status: 'error',
        });
      } else {
        setLoading(false);
        setModalContent({
          title: 'Verification Failed',
          message: 'Something went wrong. Please try again.',
          status: 'error',
        });
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      setLoading(false);
      setModalContent({
        title: 'Submission Error',
        message: 'Failed to submit verification. Please try again later.',
        status: 'error',
      });
    } finally {
      const newTrialCount = parseInt(trial) + 1;
      await AsyncStorage.setItem('trials', newTrialCount.toString());
      setLoading(false);
      setStatusModalVisible(true);
    }
  };

  const selectDocumentType = (type) => {
    setDocumentType(type);
    setDocTypeModalVisible(false);
  };

  const closeStatusModal = () => {
    if (modalContent.status === 'success') {
      setStatusModalVisible(false);
      router.push('/(protected)');
    } else {
      setStatusModalVisible(false);
    }
  };

  return (
    <PageView
      title="Upload your document for verification"
      backIcon={loading ? false : true}
    >
      <View style={styles.container}>
        <ScrollView style={{}} showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.image} />
            ) : (
              <View style={styles.placeholder}></View>
            )}
          </View>

          <Text style={styles.description}>
            For National ID and Voter's Card, the image is optional; you can
            just provide the ID number. However, for International Passport and
            Driver's License, uploading an image is required.
          </Text>

          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setDocTypeModalVisible(true)}
          >
            <Text style={styles.selectButtonText}>
              {documentType?.label || 'Select Document Type'}
            </Text>
          </TouchableOpacity>
          {['NIN_SLIP', 'VOTER_ID'].includes(documentType.value) && (
            <>
              <Text style={{ textAlign: 'center', marginBottom: 3 }}>
                {(documentType?.label || 'ID') + ' ' + 'Number'}
              </Text>
              <TextInput
                style={styles.input}
                value={idNumber}
                onChangeText={setIdNumber}
                placeholder="Enter Number"
              />
            </>
          )}

          {['NIN_SLIP', 'VOTER_ID'].includes(documentType.value) ? null : (
            <>
              <TouchableOpacity
                disabled={['NIN_SLIP', 'VOTER_ID'].includes(documentType.value)}
                style={styles.button}
                onPress={handleImageUpload}
              >
                <Text style={styles.buttonText}>Upload From Phone Library</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={['NIN_SLIP', 'VOTER_ID'].includes(documentType.value)}
                style={styles.button}
                onPress={handleImageCapture}
              >
                <Text style={styles.buttonText}>Take a Picture</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: '100px', width: '100%' }}>
            {documentType.value === 'VOTER_ID' && (
              <View style={{ position: 'relative' }}>
                <Text style={{ marginBottom: 4 }}>Sample Below</Text>
                <Image
                  source={{
                    uri: 'https://dubawa.org/wp-content/uploads/2023/01/Last-5-digit.jpeg',
                  }}
                  style={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                  }}
                  resizeMode="contain"
                />
                <View
                  style={{
                    position: 'absolute',
                    width: '40%',
                    height: 50,
                    backgroundColor: 'white',
                    bottom: '30%',
                    left: '25%',
                  }}
                ></View>
              </View>
            )}
            {documentType.value === 'PASSPORT' && (
              <>
                <Text style={{ marginBottom: 4 }}>Sample Below</Text>
                <Image
                  source={{
                    uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfE7znPo4QRYTXMXdBeuPxdILU31pX_PVWTQ&s',
                  }}
                  style={{ width: '100%', height: 180, objectFit: 'cover' }}
                  resizeMode="contain"
                />
              </>
            )}
            {documentType.value === 'DRIVERS_LICENSE' && (
              <>
                <Text style={{ marginBottom: 4 }}>Sample Below</Text>
                <Image
                  source={{
                    uri: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEL49_rKe8vGBHLcOctw32ImYwhH7gyencagpVcyIXCPsq8Cy2YNXkFBx-ibmB-PkwryqkB7aMhoEKQAvI9jGjk1O5wNnPG_SylKRdrRBVtUkyLLdNRy3TjiiPZ_olbk6Ct2WN/s1600/class-b-driving-license.JPG',
                  }}
                  style={{ width: '100%', height: 180, objectFit: 'cover' }}
                  resizeMode="contain"
                />
              </>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>FINISH</Text>
        </TouchableOpacity>

        {/* Document Type Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={docTypeModalVisible}
          onRequestClose={() => setDocTypeModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Document Type</Text>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() =>
                  selectDocumentType({
                    label: 'NATIONAL ID',
                    value: 'NIN_SLIP',
                  })
                }
              >
                <Text style={styles.modalOptionText}>NATIONAL ID</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() =>
                  selectDocumentType({
                    label: "VOTER'S CARD",
                    value: 'VOTER_ID',
                  })
                }
              >
                <Text style={styles.modalOptionText}>VOTER'S CARD</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() =>
                  selectDocumentType({
                    label: 'INTERNATIONAL PASSPORT',
                    value: 'PASSPORT',
                  })
                }
              >
                <Text style={styles.modalOptionText}>
                  INTERNATIONAL PASSPORT
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() =>
                  selectDocumentType({
                    label: 'DRIVERS_LICENSE',
                    value: 'DRIVERS_LICENSE',
                  })
                }
              >
                <Text style={styles.modalOptionText}>DRIVER'S LICENSE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setDocTypeModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Verification Status Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={statusModalVisible}
          onRequestClose={closeStatusModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {modalContent.status === 'success' && (
                <Image
                  source={require('../../assets/kyc/selfie.png')}
                  style={styles.icon}
                />
              )}
              <Text style={styles.modalTitle}>{modalContent.title}</Text>
              <Text style={[styles.modalMessage, { textAlign: 'center' }]}>
                {modalContent.message}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeStatusModal}
              >
                <Text style={styles.modalCloseButtonText}>
                  {modalContent.status === 'success' ? 'Go Home' : 'Close'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <JobModal isLoading={loading} setLoading={setLoading} />
      </View>
      {/* 
      <SelectModal
        visible={openBankModal}
        onClose={() => setOpenBankModal(false)}
        data={banks}
        selectedItem={selectedBank}
        onSelect={(item) => {
          setSelectedBank(item);
        }}
        title="Select Bank"
      /> */}
    </PageView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#EAECEF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EAECEF',
    borderRadius: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  description: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: '#F9FAFF',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  selectButtonText: {
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#EAECEF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  finishButton: {
    backgroundColor: Colors.pri,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: Colors.pri,
    borderRadius: 5,
    width: '50%',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#EAECEF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
});
