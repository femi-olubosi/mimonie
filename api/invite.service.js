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
  const contributionLink = `myapp://`;
  const message = `You are invited to join mimonie app. Click the link to open: ${contributionLink}`;

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
