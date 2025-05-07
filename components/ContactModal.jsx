import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../store/StoreContext';
import { Colors } from '../constants/Colors';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { sendUserInvite } from '../api/invite.service';
import {
  fetchUserProfile,
  fetchUserProfileForInvite,
} from '../api/user.service';
import { safeParseJSON } from '@/utils/safeJSON';
import { UserProfile } from '@/src/models';
import { DataStore } from 'aws-amplify/datastore';
import { triggerNotificationForUser } from '../api/pushNotification.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserContributions } from '../api/contributions.service';
import { validateUserContributions } from '../utils/validateUserContributions';
import Loader from './Loader';

const ContactModal = ({
  visible,
  setVisible,
  invite_link,
  amount,
  participants = [],
}) => {
  const [contactSearch, setContactSearch] = useState('');
  const { userProfile, setUserProfile, currentUser, parsed } =
    useGlobalContext();
  const [parsedConnect, setParsedConnect] = useState([]);
  const [selected, setSelected] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [inviteeContributions, setInviteeContributions] = useState([]);

  const handleSendInvite = async (invitee) => {
    if (
      participants.includes(invitee.userId) ||
      selected.includes(invitee.userId)
    ) {
      return;
    }
    setProcessing(true);

    const inviteeUser = await fetchUserProfileForInvite(invitee.userId);

    if (!inviteeUser) {
      setProcessing(false);
      Alert.alert('Error', 'User not found');
      return;
    }

    if (!inviteeUser.is_bvn_verified || !inviteeUser.is_nin_verified) {
      setProcessing(false);
      Alert.alert('Sorry!!', `${invitee?.name} is not fully verified`);
      return;
    }

    if (
      Number(inviteeUser.income_from) &&
      Number(inviteeUser.income_from) < Number(amount)
    ) {
      setProcessing(false);
      Alert.alert(
        'Sorry!!',
        `${item?.name} income is too low to join this contribution`
      );
      return;
    }

    try {
      const hisContributions = await fetchUserContributions(
        invitee.userId,
        setInviteeContributions
      );

      if (validateUserContributions(hisContributions, 'group')) {
        Alert.alert(
          'Error',
          'The user you are trying to invite is currently not available to join contributions.'
        );
        return;
      }

      await sendUserInvite(invitee.userId, invite_link);

      await AsyncStorage.setItem(
        'invited_users',
        JSON.stringify([...selected, invitee.userId])
      );
      setSelected((prev) => [...prev, invitee.userId]);

      await triggerNotificationForUser(
        invitee?.push_token,
        'Contribution Invite',
        `You have been invited to join a contribution`,
        { invite_link, type: 'invite' }
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to send invite');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const invitedUsers = AsyncStorage.getItem('invited_users');
    if (invitedUsers) {
      const parsedInvitedUsers = safeParseJSON(invitedUsers);
      if (Array.isArray(parsedInvitedUsers)) {
        setSelected(parsedInvitedUsers);
      }
    }
  }, []);

  const renderContact = ({ item }) => {
    const otherUser =
      item.senderId === userProfile.userId
        ? item.receiverDetails
        : item.senderDetails;

    return (
      <TouchableOpacity
        style={styles.contactContainer}
        onPress={() => handleSendInvite(otherUser)}
      >
        <View style={styles.contactInfo}>
          <FontAwesome name="user-circle-o" size={24} color="gray" />
          <View style={{ rowGap: 2 }}>
            <Text style={styles.contactName}>{otherUser.name}</Text>
          </View>
        </View>
        {participants.includes(otherUser.userId) ? (
          <AntDesign name="checkcircleo" size={24} color="green" />
        ) : selected.includes(otherUser.userId) ? (
          <Text style={{ color: Colors.pri }}>Invited</Text>
        ) : (
          <Text style={styles.inviteText}>Invite</Text>
        )}
      </TouchableOpacity>
    );
  };

  const filteredContacts =
    contactSearch.trim() === ''
      ? parsed
      : parsed.filter(
          (e) =>
            e.senderDetails?.name
              .toLowerCase()
              .includes(contactSearch.toLowerCase().trim()) ||
            e.receiverDetails?.name
              .toLowerCase()
              .includes(contactSearch.toLowerCase().trim())
        );

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
            <Text style={styles.modalTitle}>My Trust Circle</Text>
            <Text
              style={{
                color: 'gray',
                textAlign: 'center',
                fontSize: 11,
                marginBottom: 12,
              }}
            >
              Invite people in your trust circle to join your contribution
            </Text>
            <TextInput
              style={styles.inputSearch}
              value={contactSearch}
              onChangeText={setContactSearch}
              placeholder="Search Contact"
            />
          </View>

          <FlatList
            data={filteredContacts}
            keyExtractor={(item, idx) => idx.toString()}
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
                setSelected([]);
                router.push('/protected/mimonie');
              }}
            >
              <Text style={{ fontSize: 16, color: 'white', fontFamily: 'isb' }}>
                Done
              </Text>
            </Pressable>
          </View>
          {processing && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 8,
              }}
            >
              <View>
                <ActivityIndicator size={'large'} color={Colors.pri} />
                <Text style={{ marginTop: 10 }}>
                  Confirming user availability
                </Text>
              </View>
            </View>
          )}
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
    borderRadius: 6,
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
    marginBottom: 5,
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
  invitedText: {
    color: 'green',
  },
  inviteText: {
    color: 'green',
    borderWidth: 1,
    borderColor: 'green',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
