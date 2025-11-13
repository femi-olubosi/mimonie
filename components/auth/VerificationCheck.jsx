import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useRef, useState } from 'react';
import Container from '../Container';
import { Colors } from '../../constants/Colors';
// import { signOut } from 'aws-amplify/auth';
import * as Device from 'expo-device';
import { useGlobalContext } from '@/store/StoreContext';
import { router } from 'expo-router';
import { verifyOTP } from '../../api/token.service';
import {
  downloadUrl,
  updateAttributes,
  updateUserProfile,
} from '../../api/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthenticator } from '@aws-amplify/ui-react-native';

const VerificationCheck = () => {
  const {
    confirmationResult,
    currentUser,
    setUserProfile,
    userProfile,
    setProfilePicture,
    noAuth,
  } = useGlobalContext();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const { signOut } = useAuthenticator();

  const pinRefs = useRef([]);

  const handlePinChange = (value, index) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      pinRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && pin[index] === '' && index > 0) {
      pinRefs.current[index - 1].focus();
    }
  };

  const handleConfirmPin = async () => {
    const pinString = pin.join('');
    if (pinString.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pin');
      return;
    }

    setVerifying(true);
    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result available.');
      }
      // Attempt to verify OTP
      const res = await verifyOTP(confirmationResult?.pinId, pinString);

      if (!res.verified) {
        throw new Error('OTP verification failed. Please try again.');
      }

      // Success handling based on the confirmation type
      if (confirmationResult.type === 'phone_verification') {
        setUserProfile((prev) => ({ ...prev, phone_verified: true }));
        await updateUserProfile({ phone_verified: true }, currentUser);
        await updateAttributes({ 'custom:phone_verified': 'true' });

        // Show alert and navigate only after user taps 'OK'
        Alert.alert('Success', 'Phone number verified successfully.', [
          {
            text: 'Next',
            onPress: () => {
              router.replace('/(protected)/(tabs)');
            },
          },
        ]);
      } else if (confirmationResult.type === 'device_registration') {
        // Collect device details and update profile
        const device = {
          device_id: Device.osInternalBuildId || null,
          device_name: Device.deviceName || null,
          device_brand: Device.brand || null,
        };

        setUserProfile((prev) => ({
          ...prev,
          device_brand: device.device_brand,
          device_id: device.device_id,
          device_name: device.device_name,
        }));

        await updateUserProfile(device, currentUser, userProfile);

        // Fetch and set profile picture URL
        const url = await downloadUrl(userProfile.userId);
        setProfilePicture(url || null);

        // Show alert and navigate only after user taps 'OK'
        Alert.alert('Success', 'Device registered successfully.', [
          {
            text: 'Next',
            onPress: () => {
              router.replace('/(protected)/(tabs)');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error in handleConfirmPin:', error.message);
      Alert.alert(
        'Error',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      // Reset pin and verifying state regardless of outcome
      setPin(['', '', '', '', '', '']);
      setVerifying(false);
    }
  };

  const handleLater = async () => {
    noAuth();
    await signOut();
  };

  return (
    <Container>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View
          style={{
            backgroundColor: 'white',
            paddingVertical: 50,
            borderRadius: 24,
            paddingHorizontal: 20,
          }}
        >
          <Text style={[styles.title, { marginBottom: 10 }]}>
            Verify your phone number
          </Text>
          <Text style={{ marginBottom: 60, textAlign: 'center', fontSize: 16 }}>
            Input the 6 digit pin sent to your registered phone number
          </Text>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={{ width: '100%' }}>
                <Text style={styles.label}>Enter the 6 digit pin</Text>
                <View style={styles.pinContainer}>
                  {pin.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={styles.pinInput}
                      value={digit}
                      onChangeText={(value) => handlePinChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      ref={(ref) => (pinRefs.current[index] = ref)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      secureTextEntry
                    />
                  ))}
                </View>
              </View>

              {verifying && (
                <View style={{ marginTop: 10 }}>
                  <ActivityIndicator size="small" color={Colors.pri} />
                  <Text style={{ marginTop: 5, fontFamily: 'ir' }}>
                    Verifying account...
                  </Text>
                </View>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleLater}
                  disabled={verifying}
                >
                  <Text style={styles.modalButtonText}>Not now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmPin}
                  disabled={verifying}
                >
                  <Text style={styles.modalButtonText}>Enter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </Container>
  );
};

export default VerificationCheck;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'esb',
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
  signUp: {
    color: '#007aff',
    fontWeight: 'bold',
  },
  termsText: {
    textAlign: 'center',
    color: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'esb',
  },
  label: {
    fontSize: 15,
    color: '#1F2937',
    fontFamily: 'ir',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9095A1',
    padding: 12,
    height: 53,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: Colors.pri,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    rowGap: 24,
    minHeight: '40%',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 20,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: Colors.pri,
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 4,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    // width: 50,
    flex: 1,
    height: 50,
    fontSize: 24,
    textAlign: 'center',
  },
});
