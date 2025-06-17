import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/store/StoreContext';
import { sendInvite } from '@/api/invite.service';
import { createConnection } from '@/api/network.service';
import { triggerNotificationForUser } from '@/api/pushNotification.service';
import { getContacts } from '@/api/contact.service';
import { checkUser } from '@/api/user.service';
import { formatNigerianPhoneNumber } from '@/utils/helper';

const Contact = () => {
  const {
    userProfile,
    isLoading,
    setIsLoading,
    parsed: connections,
  } = useGlobalContext();
  const [contactSearch, setContactSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [foundUser, setFoundUser] = useState(null);
  const [checkModalVisible, setCheckModalVisible] = useState(false);
  const [modalPhone, setModalPhone] = useState('');

  const initializeContacts = async (auto: string) => {
    try {
      setIsLoading(true);
      let phoneContacts = await getContacts();
      phoneContacts = phoneContacts?.filter(
        (contact) =>
          connections.findIndex((connection: any) => {
            const formattedNumber = formatNigerianPhoneNumber(
              contact.phoneNumbers[0]
            );
            return (
              connection.senderDetails.phone_number === formattedNumber ||
              connection.receiverDetails.phone_number === formattedNumber
            );
          }) === -1
      );

      setContacts(phoneContacts);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeContacts('auto');
  }, []);

  const handleInvite = async (item: any) => {
    await sendInvite(item);
  };

  const handleRequestConnect = async (connection: any) => {
    try {
      setIsLoading(true);
      await createConnection(userProfile, connection);
      await triggerNotificationForUser(
        connection?.push_token,
        'Connect Request',
        `You have a connection request from ${userProfile.name}`,
        {
          type: 'connection',
        }
      );
      Alert.alert('Sent', 'Request sent successfully');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleRemoveRequest = async () => {
  //   Alert.alert(
  //     'Notice',
  //     'Please go to trust circle page to remove the request'
  //   );
  //   return;
  // };

  const handleCheckPhoneNumber = async (number) => {
    const formattedNumber = formatNigerianPhoneNumber(number);
    setModalPhone(number);
    setIsLoading(true);
    try {
      const user = await checkUser(formattedNumber);
      if (user) {
        // setFoundUser(user);
        // setCheckModalVisible(true);
        await handleRequestConnect(user);
      } else {
        setFoundUser(null);
        setCheckModalVisible(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Error finding user');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContact = ({ item }) => (
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
      <TouchableOpacity
        style={styles.inviteButton}
        onPress={() => handleCheckPhoneNumber(item?.phoneNumbers?.[0])}
      >
        <Text style={styles.inviteText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredContacts = contactSearch
    ? contacts.filter((item) =>
        item?.name?.toLowerCase()?.includes(contactSearch?.toLowerCase())
      )
    : contacts;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.headerText}>My Contacts</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'invite' && styles.activeTab]}
          onPress={() => setActiveTab('invite')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'invite' && styles.activeTabText,
            ]}
          >
            Invite Contacts
          </Text>
        </TouchableOpacity>
      </View>
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
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={async () => {
          setIsLoading(true);
          try {
            await initializeContacts('manual');
          } catch (e) {
            Alert.alert('Error', 'Failed to fetch contacts');
          } finally {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
      >
        <Text style={styles.floatingButtonText}>
          {isLoading ? 'Refreshing' : 'Refresh Contacts'}
        </Text>
      </TouchableOpacity>

      <CheckUserModal
        isVisible={checkModalVisible}
        onClose={() => setCheckModalVisible(false)}
        foundUser={foundUser}
        phoneNumber={modalPhone}
        onConnect={handleRequestConnect}
        onInvite={handleInvite}
        userProfile={userProfile}
      />
    </SafeAreaView>
  );
};

export default Contact;

const CheckUserModal = ({
  isVisible,
  onClose,
  foundUser,
  phoneNumber,
  onConnect,
  onInvite,
  userProfile,
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          {foundUser ? (
            <>
              <Text style={styles.modalTitle}>User Found!</Text>
              <Text style={styles.modalText}>
                <Text style={{ fontWeight: 'bold' }}>
                  {foundUser.name || 'Unknown User'}
                </Text>{' '}
                is already on the app.
              </Text>
              {userProfile?.userId === foundUser.userId ? (
                <TouchableOpacity style={styles.connectButton} disabled>
                  <Text style={styles.connectedText}>This is you!</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    onConnect(foundUser);
                    onClose();
                  }}
                >
                  <Text style={styles.modalButtonText}>Connect</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <Text style={styles.modalTitle}>No User Found</Text>
              <Text style={styles.modalText}>
                Sorry, no user found with this number ({phoneNumber}). Would you
                like to invite them?
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  onInvite(phoneNumber);
                  onClose(); // Close modal after action
                }}
              >
                <Text style={styles.modalButtonText}>Invite</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  activeTab: { backgroundColor: Colors.pri },
  tabText: { color: '#333' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
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
  requestSentButton: {},
  requestSentText: {
    color: '#666600',
    fontFamily: 'isb',
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
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.pri,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#cccccc', // Gray for close
  },
  closeModalButtonText: {
    color: '#333333',
    fontWeight: 'bold',
  },
});
