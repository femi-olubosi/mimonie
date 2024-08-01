import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Container from '../../components/Container';
import One from '../../components/identity/One';
import SelfieCapture from '../../components/identity/Three';
import DocumentCapture from '../../components/identity/Four';
import Setup from '../../components/identity/Two';
import { PageView } from '../../components/Reusable';

const DocumentIdentification = () => {
  const [selfie, setSelfie] = useState(null);
  const [idCard, setIdCard] = useState(null);
  const [status, setStatus] = useState('');
  const [step, setStep] = useState(1);

  const pickImage = async (setImage) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const handleSubmit = async () => {
    // Implement API request logic here
    setStatus('Processing...');
    try {
      const timestamp = new Date().toISOString();
      const signature = 'your_calculated_signature'; // Replace with your method to calculate the signature
      const smileClientId = 'your_smile_client_id'; // Replace with your Smile ID client ID

      const response = await fetch(
        'https://testapi.smileidentity.com/v1/upload',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callback_url: callbackUrl,
            model_parameters: {},
            partner_params: {
              job_id: jobId,
              job_type: 1,
              user_id: userId,
            },
            signature: signature,
            smile_client_id: smileClientId,
            source_sdk_version: '1.0.0',
            source_sdk: 'rest_api',
            timestamp: timestamp,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setStatus('Upload URL received. Uploading images...');
        await uploadImages(data.upload_url);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const uploadImages = async (uploadUrl) => {
    try {
      let formData = new FormData();
      formData.append('file', {
        uri: selfie,
        name: 'selfie.jpg',
        type: 'image/jpeg',
      });
      formData.append('file', {
        uri: idCard,
        name: 'idcard.jpg',
        type: 'image/jpeg',
      });

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        setStatus('Images uploaded successfully!');
      } else {
        setStatus('Failed to upload images.');
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <PageView title={'Identification'}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 40 }}>
        {step === 1 ? (
          <One setStep={setStep} />
        ) : step === 2 ? (
          <Setup />
        ) : step === 3 ? (
          <SelfieCapture setStep={setStep} />
        ) : (
          <DocumentCapture setStep={setStep} />
        )}
      </View>
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
    marginBottom: 20,
  },
  status: {
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
});

export default DocumentIdentification;
