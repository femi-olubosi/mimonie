import * as Contacts from 'expo-contacts';

export const getContacts = async () => {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status === 'granted') {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
    });

    if (data.length > 0) {
      const normalizedContacts = data
        .filter((contact) => contact.phoneNumbers?.length > 0)
        .map((contact) => ({
          id: contact.id,
          name: contact.name,
          phoneNumbers: contact.phoneNumbers.map((phone) =>
            phone.number.replace(/[^+\d]/g, '')
          ),
        }));
      return normalizedContacts;
      // setMyContacts(normalizedContacts);
    }
  }
};
