export const findMatchingUser = (users, contactDetails) => {
  for (const contact of contactDetails) {
    let normalizedContactNumber = contact.number.replace(/[^0-9]/g, '');
    if (
      normalizedContactNumber.length === 11 &&
      normalizedContactNumber.startsWith('0')
    ) {
      normalizedContactNumber = '234' + normalizedContactNumber.slice(1);
    }

    for (const user of users) {
      const normalizedUserNumber = user.phone_number.replace(/[^0-9]/g, ''); // Remove non-digit characters
      if (normalizedContactNumber === normalizedUserNumber) {
        return { found: true, userProfile: user };
      }
    }
  }
  return { found: false, userProfile: null };
};
