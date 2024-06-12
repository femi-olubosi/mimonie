import * as SMS from 'expo-sms';
import { Alert } from 'react-native';

export const sendSMSInvite = async (contact, contributionId) => {
  const contributionLink = `myapp://contribution/${contributionId}`;
  const message = `You are invited to join a contribution. Click the link to join: ${contributionLink}`;

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
