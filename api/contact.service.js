import * as Contacts from 'expo-contacts';

export const getContacts = async (setMyContacts) => {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status === 'granted') {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
    });

    if (data.length > 0) {
      const contact = data;
      setMyContacts(contact);
    }
  }
};
