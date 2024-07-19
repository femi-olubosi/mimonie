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
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '@/store/StoreContext';
import { FontAwesome } from '@expo/vector-icons';
import { topBar } from '@/cStyle';
import { sendInvite } from '@/api/invite.service';

const Contact = () => {
  const { myContacts } = useGlobalContext();
  const [contactSearch, setContactSearch] = useState('');

  const handleInvite = async (item) => {
    await sendInvite(item);
  };

  const renderContact = ({ item }) => {
    return (
      <View style={styles.contactContainer}>
        <View style={styles.contactInfo}>
          <FontAwesome name="user-circle-o" size={24} color="gray" />
          <View style={{ rowGap: 2 }}>
            <Text style={styles.contactName}>{item?.name}</Text>
          </View>
        </View>
        <Pressable onPress={() => handleInvite(item)}>
          <Text style={styles.inviteText}>Invite</Text>
        </Pressable>
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
        data={filteredContacts}
        keyExtractor={(item) => item.id}
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
