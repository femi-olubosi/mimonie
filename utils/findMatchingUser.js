export const findMatchingUser = (users, contactDetails) => {
  for (const contact of contactDetails) {
    for (const user of users) {
      if (
        user.phone_number === contact.digits ||
        user.phone_number === contact.number.replace(/[^0-9]/g, '')
      ) {
        return { found: true, userProfile: user };
      }
    }
  }
  return { found: false, userProfile: null };
};
