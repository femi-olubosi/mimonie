import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { SelectedCircle, UnSelectedCircle } from '../Circle';
import Button from '../Button';

const SelectModal = ({
  visible,
  onClose,
  data,
  selectedItem,
  onSelect,
  title = 'Select Item',
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>

          {/* List */}
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => onSelect(item)}
              >
                <View style={styles.itemContainer}>
                  {item.icon && (
                    <Image source={item.icon} style={styles.itemIcon} />
                  )}
                  <Text style={styles.itemText}>{item.label}</Text>
                </View>
                {selectedItem?.id === item.id ? (
                  <SelectedCircle />
                ) : (
                  <UnSelectedCircle />
                )}
              </TouchableOpacity>
            )}
          />

          <View style={{ marginTop: 34 }}>
            <Button title={'Done'} onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SelectModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    color: 'white',
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  itemText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'ib',
  },
  radioButtonOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E91E63',
  },
  doneButton: {
    backgroundColor: '#E91E63',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
