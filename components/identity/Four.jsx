import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const DocumentCapture = ({ setStep }) => {
  const { selfie } = route.params;
  const [idCard, setIdCard] = useState(null);
  const [status, setStatus] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setIdCard(result.uri);
    }
  };

  const handleSubmit = async () => {
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
            callback_url: 'your_callback_url', // Replace with your callback URL
            model_parameters: {},
            partner_params: {
              job_id: 'your_job_id', // Replace with your job ID
              job_type: 1,
              user_id: 'your_user_id', // Replace with your user ID
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Biometric KYC - Document Capture</Text>
      <Button title="Pick an ID card image" onPress={pickImage} />
      {idCard && <Image source={{ uri: idCard }} style={styles.image} />}
      <Button title="Submit" onPress={handleSubmit} />
      <Text style={styles.status}>{status}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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

export default DocumentCapture;
