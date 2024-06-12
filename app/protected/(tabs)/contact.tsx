import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '@/store/StoreContext';
import { FontAwesome } from '@expo/vector-icons';

const Contact = () => {
  const { myContacts } = useGlobalContext();

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
    <SafeAreaView>
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
      <FlatList
        data={myContacts}
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
});
