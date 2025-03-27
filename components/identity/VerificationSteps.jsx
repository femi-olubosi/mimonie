import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { PageView } from '../Reusable';
import Button from '../Button';
import { Colors } from '../../constants/Colors';
import { router } from 'expo-router';
import { useGlobalContext } from '../../store/StoreContext';

export default function VerificationSteps() {
  const { userProfile } = useGlobalContext();

  const handleStart = () => {
    // if (userProfile.is_nin_verified) {
    //   Alert.alert('Verification', 'You are already verified');
    //   return;
    // }

    router.push('/protected/take_selfie');
  };

  return (
    <PageView title={'Identity Verification (KYC)'}>
      <View style={styles.container}>
        <View style={styles.stepContainer}>
          <Image
            source={require('../../assets/kyc/selfie.png')}
            // source={{
            //   uri: 'https://img.icons8.com/color/96/000000/selfie.png',
            // }}
            style={styles.icon}
          />
          <Text style={styles.stepText}>Step 1: Take a selfie</Text>
        </View>
        <View style={styles.stepContainer}>
          <Image
            source={require('../../assets/kyc/doc.png')}
            style={styles.icon}
          />
          <Text style={styles.stepText}>Step 2: Upload a document</Text>
        </View>
        <View style={styles.stepContainer}>
          <Image
            source={require('../../assets/kyc/verified.png')}
            // source={{
            //   uri: 'https://img.icons8.com/color/96/000000/approval.png',
            // }}
            style={styles.icon}
          />
          <Text style={styles.stepText}>Step 3: Get verified</Text>
        </View>
        <Button title={'Start Now'} color={Colors.pri} onPress={handleStart} />
      </View>
    </PageView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFF',
    padding: 20,
  },
  stepContainer: {
    backgroundColor: '#EAF3FF',
    width: '100%',
    borderRadius: 10,
    // paddingVertical: 24,
    paddingHorizontal: 12,
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0056D2',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
