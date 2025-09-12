import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import Button from '../Button';
import { Colors } from '../../constants/Colors';

const DeleteRequestModal = ({ visible, onClose, onDelete, deleting }) => {
  const [reason, setReason] = useState('');

  return (
    <ModalWrapper visible={visible} onClose={onClose}>
      <View style={styles.modal}>
        <Text style={styles.modalText}>
          Are you sure you want to delete your account?
        </Text>
        <Text style={{ fontSize: 12 }}>
          All your data will be deleted entire from system.
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter reason for deletion"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={6}
        />
        {deleting && <ActivityIndicator size={'large'} color={Colors.pri} />}
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onClose}
            color={'gray'}
            styleOverride={{ flex: 1 }}
          />
          <Button
            title="Delete"
            onPress={() => onDelete(reason)}
            color={'red'}
            styleOverride={{ flex: 1 }}
          />
        </View>
      </View>
    </ModalWrapper>
  );
};

export default DeleteRequestModal;

const styles = StyleSheet.create({
  modal: {
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  textInput: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
    columnGap: 20,
  },
});
