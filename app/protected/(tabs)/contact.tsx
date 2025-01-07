import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '@/store/StoreContext';
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { topBar } from '@/cStyle';
import { sendInvite } from '@/api/invite.service';
import { Colors } from '@/constants/Colors';
import { fetchAllUsers } from '@/api/admin.service';
import { findMatchingUser } from '@/utils/findMatchingUser';
import { undoRequest, updateUserConnections } from '@/api/network.service';
import { fetchUserProfile } from '@/api/user.service';
import { UserProfile } from '@/src/models';
import { DataStore } from 'aws-amplify/datastore';
import { safeParseJSON } from '@/utils/safeJSON';
import { triggerNotificationForUser } from '@/api/pushNotification.service';

const Contact = () => {
  const {
    myContacts,
    setAllUsers,
    allUsers,
    userProfile,
    setUserProfile,
    currentUser,
    setIsLoading,
    parsed,
    setParsed,
  } = useGlobalContext();
  const [contactSearch, setContactSearch] = useState('');
  const [foundUsers, setFoundUsers] = useState(null);
  const [] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchAllUsers(setAllUsers);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const checkAvailableContacts = async () => {
      setIsLoading(true); // Start loader

      try {
        const checkAvailable =
          myContacts && Array.isArray(myContacts)
            ? myContacts
                ?.map((contact) => {
                  const res = findMatchingUser(allUsers, contact.phoneNumbers);
                  return res?.found ? contact : null;
                })
                ?.filter((e) => e)
            : [];

        setFoundUsers(checkAvailable);
      } catch (error) {
        console.error('Error checking available contacts:', error);
      } finally {
        setIsLoading(false); // Stop loader
      }
    };

    checkAvailableContacts();
  }, [allUsers, myContacts]);

  const handleInvite = async (item) => {
    await sendInvite(item);
  };

  const handleRequestConnect = async (connections: {}) => {
    setIsLoading(true);
    setParsed((prevData) => [
      ...prevData,
      {
        ...connections,
        status: 'pending',
      },
    ]);

    // setIsLoading(true);
    try {
      // Perform the backend operation
      await updateUserConnections(connections, userProfile);
      await fetchUserProfile(setUserProfile, currentUser);
      await triggerNotificationForUser(
        connections?.push_token,
        'Connect Request',
        `You have a connection request from ${userProfile.name}`
      );
      setModalVisible(true);
    } catch (error) {
      console.error(error);
      // Optional: You could undo the local state change if the backend fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRequest = async (data: {}) => {
    setIsLoading(true);
    setParsed((prevData) =>
      prevData.filter((e) => e?.phone_number !== data?.phone_number)
    );

    try {
      // Perform the backend operation
      await undoRequest(data, userProfile);
      await fetchUserProfile(setUserProfile, currentUser);
    } catch (error) {
      console.error(error);
      // Optional: You could revert the local state change if the backend fails
    } finally {
      setIsLoading(false);
    }
  };
  console.log(parsed);
  // useEffect(() => {
  //   if (userProfile) {
  //     console.log('ran');
  //     const parsedData = safeParseJSON(userProfile?.connections, []);
  //     setParsed(parsedData);
  //   }
  // }, []);

  const renderContact = ({ item }) => {
    const contactDetails = item?.phoneNumbers;

    const res = findMatchingUser(allUsers, contactDetails);
    const connections = {
      userId: res?.userProfile?.userId,
      name: res?.userProfile?.name,
      phone_number: res?.userProfile?.phone_number,
      email: res?.userProfile?.email,
      invites: res?.userProfile?.invites,
      occupation: res?.userProfile?.occupation,
      push_token: res?.userProfile?.push_token,
      income_from: res?.userProfile?.income_from,
      verified:
        res?.userProfile?.is_nin_verified && res?.userProfile?.is_bvn_verified,
      status: 'pending',
      type: 'user',
    };

    const requested = parsed?.find(
      (e) =>
        e?.phone_number === res?.userProfile?.phone_number &&
        e?.status === 'pending'
    );

    const connected = parsed?.find(
      (e) =>
        e?.phone_number === res?.userProfile?.phone_number &&
        e?.status === 'accepted'
    );

    return (
      <View style={styles.contactContainer}>
        <View style={styles.contactInfo}>
          <FontAwesome name="user-circle-o" size={24} color="gray" />
          <View style={{ rowGap: 2 }}>
            <Text style={styles.contactName}>{item?.name}</Text>
          </View>
        </View>

        <View style={{}}>
          {res?.found ? (
            <View
              style={{
                flexDirection: 'row',
                columnGap: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                style={{
                  paddingHorizontal: 4,
                  paddingVertical: 6,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: requested ? '#ecb753' : Colors.pri,
                }}
                onPress={() => {
                  if (requested || connected) {
                    return;
                  }
                  handleRequestConnect(connections);
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    color: requested ? '#ecb753' : Colors.pri,
                  }}
                >
                  {requested ? 'Pending' : connected ? 'Connected' : 'Connect'}
                </Text>
              </TouchableOpacity>
              {requested && (
                <TouchableOpacity
                  style={{
                    padding: 4,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: 'red',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => handleRemoveRequest(res?.userProfile)}
                >
                  <FontAwesome6 name="times-circle" size={14} color={'red'} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Pressable onPress={() => handleInvite(item)}>
              <Text style={styles.inviteText}>Invite</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const filteredContacts =
    myContacts && Array.isArray(myContacts)
      ? myContacts
          ?.filter(
            (e) =>
              e.name &&
              typeof e.name === 'string' &&
              e.name.toLowerCase().includes(contactSearch?.toLowerCase().trim())
          )
          ?.sort((a, b) => a.name.localeCompare(b.name))
      : [];

  return (
    <SafeAreaView style={{ paddingTop: topBar }}>
      <StatusBar style="dark" />
      <Text
        style={{
          marginVertical: 20,
          textAlign: 'center',
          fontFamily: 'isb',
          fontSize: 16,
        }}
      >
        My Contacts
      </Text>
      <View style={{ paddingHorizontal: 20 }}>
        <TextInput
          style={styles.inputSearch}
          value={contactSearch}
          onChangeText={setContactSearch}
          placeholder="Search Contact"
        />
      </View>
      <FlatList
        data={
          foundUsers ? [...foundUsers, ...filteredContacts] : filteredContacts
        }
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={renderContact}
        showsVerticalScrollIndicator={false}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Sent!</Text>
            <Text style={styles.modalText}>Connect request successfully.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                fetchUserProfile(setUserProfile, currentUser);
                setModalVisible(false);
              }}
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
  inputSearch: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9095A1',
    padding: 12,
    height: 40,
    width: '100%',
    alignSelf: 'center',
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
    width: '60%',
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
});
