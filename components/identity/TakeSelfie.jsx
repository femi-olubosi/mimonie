import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import SelfieCamera from './SelfieCamera';
import { PageView } from '../Reusable';
import Button from '../Button';
import { Colors } from '../../constants/Colors';
import { router } from 'expo-router';
import { useGlobalContext } from '../../store/StoreContext';

export default function TakeSelfie() {
  const [selfie, setSelfie] = useState(null);
  const { setKycForm, kycForm } = useGlobalContext();
  const cameraRef = useRef(null);
  const [tapped, setTapped] = useState(false);

  const takePicture = async () => {
    setTapped(true);
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.1,
      });
      setKycForm({ ...kycForm, selfie: photo.base64 });
      // setKycForm({ ...kycForm, selfie: photo.uri });
      setSelfie(photo.uri);
      setTapped(false);
    }
  };

  const retake = () => {
    setSelfie(null);
  };
  console.log(tapped);
  return (
    <PageView title={'Take a Selfie'}>
      <View style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title}>Let’s get your selfie and process it</Text>

          <View style={styles.selfieContainer}>
            {selfie ? (
              <Image source={{ uri: selfie }} style={styles.selfiePreview} />
            ) : (
              <SelfieCamera ref={cameraRef} direction={'front'} />
              // <View>Yo!!!</View>
            )}
          </View>

          <Text style={styles.subTitle}>Smart Capture</Text>
          <Text style={styles.description}>
            We will place your selfie image in the oval above. Click use this if
            you are satisfied with it.
          </Text>
        </View>
        <Button
          title={tapped ? 'PLEASE WAIT' : selfie ? 'RETAKE' : 'TAKE SELFIE'}
          color={Colors.pri}
          onPress={selfie ? retake : takePicture}
          disabled={tapped}
        />
        <Button
          title={'USE THIS'}
          color={Colors.pri}
          disabled={!selfie}
          styleOverride={!selfie && styles.disabledButton}
          onPress={() => router.push('/(protected)/upload_doc')}
        />
      </View>
    </PageView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFF',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'ir',
    color: '#333',
    marginBottom: 20,
  },
  selfieContainer: {
    width: 250,
    height: 260,
    borderRadius: 145,
    overflow: 'hidden',
    marginBottom: 16,
  },
  selfiePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  subTitle: {
    fontSize: 20,
    fontFamily: 'ir',
    color: '#333',
    marginBottom: 30,
  },
  description: {
    fontSize: 18,
    fontFamily: 'ir',
    maxWidth: '80%',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#0056D2',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});
