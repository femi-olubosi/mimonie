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
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useGlobalContext } from '@/store/StoreContext';
import { sendInvite } from '@/api/invite.service';
import { fetchUserConnections, createConnection } from '@/api/network.service';
import { fetchExistingUser } from '@/api/user.service';
import { triggerNotificationForUser } from '@/api/pushNotification.service';
import { getContacts } from '@/api/contact.service';
import { DataStore } from 'aws-amplify/dist/esm/datastore';
import { UserConnections } from '@/src/models';

const Contact = () => {
  const { userProfile, isLoading, setIsLoading } = useGlobalContext();
  const [contactSearch, setContactSearch] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [connectionList, setConnectionList] = useState([]);
  const [pendingConnectionList, setPendingConnectionList] = useState([]);

  const listConnections = async () => {
    setIsLoading(true);
    try {
      const response = await fetchUserConnections(userProfile.userId);

      // Extract sender and receiver IDs from accepted connections
      const acceptedConnections = response
        .filter((connection) => connection.status === 'accepted')
        .flatMap((connection) =>
          connection.senderId === userProfile.userId
            ? [connection.receiverId]
            : [connection.senderId]
        );

      // Extract sender and receiver IDs from pending connections
      const pendingConnections = response
        .filter((connection) => connection.status === 'pending')
        .flatMap((connection) =>
          connection.senderId === userProfile.userId
            ? [connection.receiverId]
            : [connection.senderId]
        );

      setConnectionList(acceptedConnections);
      setPendingConnectionList(pendingConnections);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncConnections = async () => {
    try {
      const response = await fetchUserConnections(userProfile.userId);

      // Extract sender and receiver IDs from accepted connections
      const acceptedConnections = response
        .filter((connection) => connection.status === 'accepted')
        .flatMap((connection) =>
          connection.senderId === userProfile.userId
            ? [connection.receiverId]
            : [connection.senderId]
        );

      // Extract sender and receiver IDs from pending connections
      const pendingConnections = response
        .filter((connection) => connection.status === 'pending')
        .flatMap((connection) =>
          connection.senderId === userProfile.userId
            ? [connection.receiverId]
            : [connection.senderId]
        );

      setConnectionList(acceptedConnections);
      setPendingConnectionList(pendingConnections);
    } catch (error) {
      console.error(error);
    }
  };

  const initializeContacts = async (auto: string) => {
    try {
      setIsLoading(true);
      let phoneContacts = await getContacts();
      const matchedUsers = await fetchExistingUser(phoneContacts, auto);

      phoneContacts = phoneContacts?.filter(
        (contact) =>
          matchedUsers.findIndex(
            (user) => user.phoneNumbers[0] === contact.phoneNumbers[0]
          ) === -1
      );

      setContacts(phoneContacts);
      setFoundUsers(
        matchedUsers.filter((e) => e.userId !== userProfile.userId)
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeContacts('auto');
    listConnections();

    const subscription = DataStore.observe(UserConnections).subscribe(() => {
      syncConnections();
    });

    return () => subscription.unsubscribe();
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
      setModalVisible(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRequest = async () => {
    Alert.alert('Notice', 'Please go to network page to remove the request');
    return;
  };

  const renderUser = ({ item }) => {
    const connected = connectionList.includes(item?.userId);
    const requested = pendingConnectionList.includes(item?.userId);

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
            onPress={handleRemoveRequest}
          >
            <Text style={styles.requestSentText}>Request Sent</Text>
          </TouchableOpacity>
        ) : connected ? (
          <View style={styles.connectedContainer}>
            <MaterialIcons name="check-circle" size={20} color={'green'} />
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => handleRequestConnect(item.userProfile)}
          >
            <MaterialIcons name="add-circle" size={20} color={Colors.pri} />
            <Text style={styles.connectText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
        onPress={() => handleInvite(item)}
      >
        <Text style={styles.inviteText}>Invite</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredContacts =
    activeTab === 'users'
      ? contactSearch
        ? foundUsers.filter((item) =>
            item?.name?.toLowerCase()?.includes(contactSearch?.toLowerCase())
          )
        : foundUsers
      : contactSearch
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
          style={[styles.tabButton, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'users' && styles.activeTabText,
            ]}
          >
            Registered Users
          </Text>
        </TouchableOpacity>
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
        renderItem={activeTab === 'users' ? renderUser : renderContact}
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
});
