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

const SelfieCapture = ({ setStep }) => {
  const [selfie, setSelfie] = useState(null);
  const [status, setStatus] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelfie(result.uri);
    }
  };

  const handleNext = () => {
    if (!selfie) {
      setStatus('Please upload a selfie.');
      return;
    }
    navigation.navigate('DocumentCapture', { selfie });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Biometric KYC - Selfie Capture</Text>
      <Button title="Pick a selfie image" onPress={pickImage} />
      {selfie && <Image source={{ uri: selfie }} style={styles.image} />}
      <Button title="Next" onPress={handleNext} />
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
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

export default SelfieCapture;
