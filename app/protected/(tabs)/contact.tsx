import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/store/StoreContext';
import { sendInvite } from '@/api/invite.service';
import { updateUserConnections, undoRequest } from '@/api/network.service';
import { fetchExistingUser } from '@/api/user.service';
import { triggerNotificationForUser } from '@/api/pushNotification.service';
import { getContacts } from '@/api/contact.service';

const Contact = () => {
  const { userProfile, setUserProfile, currentUser, setIsLoading } =
    useGlobalContext();
  const [contactSearch, setContactSearch] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchAllUsersData = async () => {
      try {
        setIsLoading(true);
        let phoneContacts = await getContacts();
        const matchedUsers = await fetchExistingUser(phoneContacts);
        phoneContacts = phoneContacts?.filter(
          (contact) =>
            matchedUsers.findIndex(
              (user) => user.phoneNumbers[0] === contact.phoneNumbers[0]
            ) === -1
        );
        setContacts(phoneContacts);
        setFoundUsers(matchedUsers);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUsersData();
  }, []);

  const handleInvite = async (item) => {
    await sendInvite(item);
  };

  const handleRequestConnect = async (connections) => {
    try {
      setIsLoading(true);
      await updateUserConnections(connections, userProfile);
      const updatedUsers = await fetchExistingUser(contacts);
      setFoundUsers(updatedUsers);
      await triggerNotificationForUser(
        connections?.push_token,
        'Connect Request',
        `You have a connection request from ${userProfile.name}`
      );
      setModalVisible(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRequest = async (data) => {
    try {
      setIsLoading(true);
      await undoRequest(data, userProfile);
      const updatedUsers = await fetchExistingUser(contacts);
      setFoundUsers(updatedUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContact = ({ item }) => {
    const connections = {
      userId: item?.userProfile?.userId,
      name: item?.userProfile?.name,
      phone_number: item?.userProfile?.phone_number,
      email: item?.userProfile?.email,
      invites: item?.userProfile?.invites,
      occupation: item?.userProfile?.occupation,
      push_token: item?.userProfile?.push_token,
      verified:
        item?.userProfile?.is_nin_verified &&
        item?.userProfile?.is_bvn_verified,
      status: 'pending',
      type: 'user',
    };

    const connected = item?.connections?.some(
      (e) => e?.userId === userProfile.userId && e?.status === 'accepted'
    );
    const requested = item?.connections?.some(
      (e) => e?.userId === userProfile.userId && e?.status === 'pending'
    );

    return (
      <View style={styles.contactContainer}>
        <View style={styles.contactInfo}>
          <FontAwesome name="user-circle-o" size={26} color={'gray'} />
          <View>
            <Text style={styles.contactName}>{item?.name}</Text>
            <Text style={styles.contactOccupation}>
              {item?.phoneNumbers?.[0]}
            </Text>
          </View>
        </View>
        {requested ? (
          <TouchableOpacity
            style={styles.requestSentButton}
            onPress={() => handleRemoveRequest(item.userProfile)}
          >
            <MaterialIcons name="cancel" size={20} color={'red'} />
            <Text style={styles.requestSentText}>Cancel Request</Text>
          </TouchableOpacity>
        ) : connected ? (
          <View style={styles.connectedContainer}>
            <MaterialIcons name="check-circle" size={20} color={'green'} />
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        ) : item.userProfile ? (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => handleRequestConnect(connections)}
          >
            <MaterialIcons name="add-circle" size={20} color={Colors.pri} />
            <Text style={styles.connectText}>Connect</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => handleInvite(item)}
          >
            <Text style={styles.inviteText}>Invite</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const users = foundUsers ? [...foundUsers, ...contacts] : contacts;

  const filteredContacts = contactSearch
    ? users.filter((item) =>
        item?.name?.toLowerCase()?.includes(contactSearch?.toLowerCase())
      )
    : users;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.headerText}>My Contacts</Text>
      <TextInput
        style={styles.inputSearch}
        value={contactSearch}
        onChangeText={setContactSearch}
        placeholder="Search Contact"
        placeholderTextColor={'gray'}
      />
      <FlatList
        data={filteredContacts}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={renderContact}
        showsVerticalScrollIndicator={false}
      />
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalText}>Connect request sent.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Contact;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    marginVertical: 20,
    textAlign: 'center',
    fontFamily: 'isb',
    fontSize: 16,
  },
  inputSearch: {
    backgroundColor: '#ffffff', // White
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d3d3d3', // Light gray border
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc', // Gainsboro
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactName: {
    fontSize: 13,
    fontFamily: 'isb',
    color: '#333333', // Dark gray
  },
  contactOccupation: {
    fontSize: 10,
    color: '#808080', // Gray
  },
  inviteButton: {
    backgroundColor: Colors.pri, // Dodger blue
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inviteText: {
    color: '#ffffff', // White
    fontWeight: 'bold',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.pri,
  },
  connectText: {
    color: Colors.pri,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    color: '#32cd32', // Lime green
    marginLeft: 4,
    fontWeight: 'bold',
  },
  requestSentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcdcdc', // Gainsboro
    padding: 8,
    borderRadius: 4,
  },
  requestSentText: {
    color: '#ff4500', // Orange red
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#ffffff', // White
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#808080', // Gray
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1e90ff', // Dodger blue
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#ffffff', // White
    fontWeight: 'bold',
  },
});
