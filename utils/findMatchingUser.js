export const findMatchingUser = (users, contactDetails) => {
  // Check if users is an array
  if (!Array.isArray(users)) {
    console.error('Invalid users array:', users);
    return { found: false, userProfile: null };
  }

  // Check if contactDetails is an array
  if (!Array.isArray(contactDetails)) {
    console.error('Invalid contactDetails array:', contactDetails);
    return { found: false, userProfile: null };
  }

  for (const contact of contactDetails) {
    // Ensure contact has a valid number
    if (typeof contact.number !== 'string') {
      console.error('Invalid contact number:', contact.number);
      continue; // Skip to the next contact if number is not a string
    }

    let normalizedContactNumber = contact.number.replace(/[^0-9]/g, '');
    if (
      normalizedContactNumber.length === 11 &&
      normalizedContactNumber.startsWith('0')
    ) {
      normalizedContactNumber = '234' + normalizedContactNumber.slice(1);
    }

    for (const user of users) {
      // Ensure user has a valid phone_number
      if (typeof user.phone_number !== 'string') {
        console.error('Invalid user phone number:', user.phone_number);
        continue; // Skip to the next user if phone_number is not a string
      }

      const normalizedUserNumber = user.phone_number.replace(/[^0-9]/g, ''); // Remove non-digit characters
      if (normalizedContactNumber === normalizedUserNumber) {
        return { found: true, userProfile: user };
      }
    }
  }

  return { found: false, userProfile: null };
};
