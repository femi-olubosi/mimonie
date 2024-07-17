import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '@/store/StoreContext';
import { FontAwesome } from '@expo/vector-icons';
import { topBar } from '@/cStyle';

const Contact = () => {
  const { myContacts } = useGlobalContext();
  const [contactSearch, setContactSearch] = useState('');

  const renderContact = ({ item }) => (
    <View style={styles.contactContainer}>
      <View style={styles.contactInfo}>
        <FontAwesome name="user-circle-o" size={24} color="gray" />
        <View style={{ rowGap: 2 }}>
          <Text style={styles.contactName}>{item.name}</Text>
          {/* {item.phoneNumbers &&
            item.phoneNumbers.map((phone, index) => (
              <TouchableOpacity key={index}>
                <Text style={styles.phoneNumber}>
                  {phone.number} ({phone.label})
                </Text>
              </TouchableOpacity>
            ))} */}
        </View>
      </View>
      <Text style={styles.inviteText}>Invite</Text>
    </View>
  );

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
        data={myContacts.filter((e) =>
          e.name.toLowerCase().includes(contactSearch.toLowerCase().trim())
        )}
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
