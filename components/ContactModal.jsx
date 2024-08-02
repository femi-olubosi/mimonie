import { router } from 'expo-router';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { useGlobalContext } from '../store/StoreContext';
import { Colors } from '../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { sendSMSInvite } from '../api/invite.service';

const ContactModal = ({ visible, setVisible, invite_link }) => {
  const [contactSearch, setContactSearch] = useState('');
  const { myContacts } = useGlobalContext();
  console.log('invite', invite_link);
  const handleSendInvite = async (item) => {
    await sendSMSInvite(item, invite_link);
  };

  const renderContact = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.contactContainer}
        onPress={() => handleSendInvite(item)}
      >
        <View style={styles.contactInfo}>
          <FontAwesome name="user-circle-o" size={24} color="gray" />
          <View style={{ rowGap: 2 }}>
            <Text style={styles.contactName}>{item.name}</Text>
          </View>
        </View>
        <Text style={styles.inviteText}>Invite</Text>
      </TouchableOpacity>
    );
  };

  const filteredContacts =
    myContacts && Array.isArray(myContacts)
      ? myContacts.filter(
          (e) =>
            e.name &&
            typeof e.name === 'string' &&
            e.name.toLowerCase().includes(contactSearch.toLowerCase().trim())
        )
      : [];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalContainerContact}>
        <View style={styles.modalViewContact}>
          <Pressable
            style={{
              width: 100,
              height: 3,
              backgroundColor: 'gray',
              position: 'absolute',
              borderRadius: 10,
              top: 2,
              alignSelf: 'center',
            }}
            onPress={() => setVisible(false)}
          ></Pressable>
          <View style={{ paddingVertical: 10 }}>
            <Text style={styles.modalTitle}>Contacts</Text>
            <TextInput
              style={styles.inputSearch}
              value={contactSearch}
              onChangeText={setContactSearch}
              placeholder="Search Contact"
            />
          </View>

          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContact}
          />
          <View style={{ paddingVertical: 20 }}>
            <Pressable
              style={{
                backgroundColor: Colors.pri,
                alignSelf: 'center',
                paddingHorizontal: 40,
                paddingVertical: 10,
                borderRadius: 8,
              }}
              onPress={() => {
                setVisible(false);
                router.push('/protected/mimonie');
              }}
            >
              <Text style={{ fontSize: 16, color: 'white', fontFamily: 'isb' }}>
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ContactModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#1F2937',
    fontFamily: 'ir',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9095A1',
    padding: 12,
    height: 53,
  },
  inputSearch: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9095A1',
    padding: 12,
    height: 40,
    width: '90%',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#006EBD',
    borderRadius: 12,
    // padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    height: 44,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainerContact: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalViewContact: {
    width: '95%',
    height: '85%',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'isb',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  inviteLink: {
    fontSize: 14,
    color: '#2563EB',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },

  contactName: {
    fontSize: 14,
    fontFamily: 'ir',
  },
  phoneNumber: {
    color: 'blue',
  },
  inviteText: {
    color: 'green',
  },
});
