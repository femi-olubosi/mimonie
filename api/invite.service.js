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
  const contributionLink = `https://mimonie.net`;
  const message = `You are invited to join mimonie app. Click the link to open: ${contributionLink}`;

  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    const { result } = await SMS.sendSMSAsync(
      [contact.phoneNumbers[0]],
      message
    );
    console.log(result);
  } else {
    Alert.alert('SMS is not available on this device');
  }
};

export const fetchInviteContributions = async (inviteLinks) => {
  try {
    const allContributions = await DataStore.query(Contribution);

    const filteredContributions = allContributions.filter((contribution) =>
      inviteLinks.includes(contribution.id)
    );

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
    const invitee = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(userId)
    );

    if (!invitee[0]) {
      throw new Error('User profile not found');
    }

    DataStore.save(
      UserProfile.copyOf(invitee[0], (updated) => {
        updated.invites.push(invite_link);
      })
    );
  } catch (error) {
    console.error('Error updating user invite:', error);
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
