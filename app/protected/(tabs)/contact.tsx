import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '@/store/StoreContext';
import { FontAwesome } from '@expo/vector-icons';
import { topBar } from '@/cStyle';
import { sendInvite } from '@/api/invite.service';
import { Colors } from '@/constants/Colors';
import { fetchAllUsers } from '@/api/admin.service';
import { findMatchingUser } from '@/utils/findMatchingUser';
import { updateUserConnections } from '@/api/network.service';
import { fetchUserProfile } from '@/api/user.service';

const Contact = () => {
  const {
    myContacts,
    setAllUsers,
    allUsers,
    userProfile,
    setUserProfile,
    currentUser,
  } = useGlobalContext();
  const [contactSearch, setContactSearch] = useState('');
  const [foundUsers, setFoundUsers] = useState(null);

  useEffect(() => {
    fetchAllUsers(setAllUsers);
  }, []);

  const handleInvite = async (item) => {
    await sendInvite(item);
  };

  const handleRequestConnect = async (connections: {}) => {
    try {
      await updateUserConnections(connections, userProfile);
      await fetchUserProfile(setUserProfile, currentUser);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const checkAvailable = myContacts
      ?.map((contact) => {
        const res = findMatchingUser(allUsers, contact.phoneNumbers);
        // return contact;
        return res?.found ? contact : null;
      })
      ?.filter((e) => e);

    setFoundUsers(checkAvailable);
  }, [allUsers]);

  console.log('found', foundUsers);

  const renderContact = ({ item }) => {
    const contactDetails = item.phoneNumbers;

    // const { found, userProfile } = findMatchingUser(allUsers, contactDetails);
    const res = findMatchingUser(allUsers, contactDetails);

    const connections = {
      userId: userProfile?.userId,
      name: userProfile?.name,
      phone_number: userProfile?.phone_number,
      email: userProfile?.email,
      occupation: userProfile?.occupation,
      verified: userProfile?.is_nin_verified && userProfile?.is_bvn_verified,
      status: 'pending',
      type: 'user',
    };

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
            <Pressable
              style={{
                paddingHorizontal: 4,
                paddingVertical: 6,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: Colors.pri,
                marginTop: 3,
              }}
              onPress={() => handleRequestConnect(connections)}
            >
              <Text
                style={{
                  fontSize: 8,
                  color: Colors.pri,
                }}
              >
                Request Connection
              </Text>
            </Pressable>
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
      ? myContacts.filter(
          (e) =>
            e.name &&
            typeof e.name === 'string' &&
            e.name.toLowerCase().includes(contactSearch.toLowerCase().trim())
        )
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
        My Contact
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
      />
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
});
