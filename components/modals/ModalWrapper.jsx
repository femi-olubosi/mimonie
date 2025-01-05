import { Modal, StyleSheet, View, Pressable, Text } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const ModalWrapper = ({ children, visible, onClose, headerText = '' }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.draggableIndicator}
            onPress={onClose}
          />
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="arrowleft" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{headerText}</Text>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default ModalWrapper;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayPressable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
    flex: 1,
  },
  draggableIndicator: {
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'black',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
