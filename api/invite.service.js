import { DataStore } from 'aws-amplify/datastore';
import { Contribution, UserProfile } from '../src/models';
import * as SMS from 'expo-sms';
import { Alert } from 'react-native';

export const sendSMSInvite = async (contact, inviteLink) => {
  const message = `You are invited to join a contribution. Click the link to join: ${inviteLink}`;

  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    const { result } = await SMS.sendSMSAsync(
      [
        contact.phoneNumbers[0].label !== 'home'
          ? contact.phoneNumbers[0].number
          : contact.phoneNumbers[1].number,
      ],
      message
    );
    console.log(result);
  } else {
    Alert.alert('SMS is not available on this device');
  }
};

export const sendInvite = async (contact) => {
  const appLink = `https://onelink.to/v28cvx`;
  const message = `🚀 Discover Mimonie! Your new way to create contribution groups and grow savings with your trusted circle. Download the app now and get started 👉: ${appLink}`;

  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    const { result } = await SMS.sendSMSAsync([contact], message);
    console.log(result);
  } else {
    Alert.alert('SMS is not available on this device');
  }
};

export const fetchInviteContributions = async (inviteLinks) => {
  try {
    if (!Array.isArray(inviteLinks) || inviteLinks.length === 0) {
      return [];
    }

    const filteredContributions = await Promise.all(
      inviteLinks.map((id) => DataStore.query(Contribution, id))
    ).then((results) => results.flat().filter(Boolean));

    // Sort the filtered contributions by creation date
    const sorted = filteredContributions.sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : 1
    );
    return sorted;
  } catch (error) {
    console.error('Error fetching user contributions:', error);
  }
};

export const sendUserInvite = async (userId, invite_link) => {
  try {
    // const invitee = await DataStore.query(UserProfile, (c) =>
    //   c.userId.eq(userId)
    // );

    const contribution = await DataStore.query(Contribution, invite_link);

    // if (!invitee[0]) {
    //   throw new Error('User profile not found');
    // }

    if (!contribution) {
      throw new Error('Contribution not found');
    }

    DataStore.save(
      Contribution.copyOf(contribution, (updated) => {
        updated.access.push(userId);
      })
    );
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
};

export const updateInvite = async (userId, invite_link) => {
  try {
    const invitee = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(userId)
    );

    if (!invitee[0]) {
      throw new Error('User profile not found');
    }
    const currentInvites = invitee[0].invites || [];
    const updatedInvites = currentInvites.filter(
      (link) => link !== invite_link
    );

    DataStore.save(
      UserProfile.copyOf(invitee[0], (updated) => {
        updated.invites = updatedInvites;
      })
    );
  } catch (error) {
    console.error('Error updating user invite:', error);
    throw error;
  }
};
