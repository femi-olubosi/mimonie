import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ModalWrapper from './ModalWrapper';
import Button from '@/components/Button';
import { router } from 'expo-router';

const UserVerificationModal = ({
  visible,
  onClose,
  userName,
  completedSteps,
}) => {
  const steps = [
    { key: 'bvn', label: 'BVN Verification', path: '/protected/bvn' },
    { key: 'kyc', label: 'KYC Verification', path: '/protected/smile_id' },
    { key: 'card', label: 'Add Card', path: '/protected/cards' },
  ];

  const remainingSteps = steps?.filter(
    (step) => !completedSteps?.includes(step.key)
  );

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      headerText="Complete Verification"
    >
      <Text style={styles.greeting}>Hi, {userName}!</Text>
      <Text style={styles.message}>
        Please complete the setup below to enjoy using the app without
        restrictions:
      </Text>
      <View style={styles.stepsContainer}>
        {remainingSteps?.map((step) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
            key={step.key}
          >
            <Text style={styles.stepText}>{step?.label}</Text>
            <TouchableOpacity
              style={{
                paddingHorizontal: 5,
                paddingVertical: 2,
                borderWidth: 1,
                borderRadius: 4,
              }}
              onPress={() => {
                onClose();
                router.push(step.path);
              }}
            >
              <Text key={step.key} style={styles.step}>
                {'Complete Now'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          color={'gray'}
          title={'Not Now'}
          onPress={() => {
            onClose();
          }}
          outline={true}
          styleOverride={{ width: '100%' }}
        />
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  stepsContainer: {
    marginBottom: 20,
    gap: 12,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  stepText: {
    fontSize: 16,
    marginVertical: 5,
    fontFamily: 'ir',
  },
  step: {
    fontSize: 12,
    marginVertical: 5,
  },
  completedMessage: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  laterButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  completeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default UserVerificationModal;
