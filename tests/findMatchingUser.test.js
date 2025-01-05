import { findMatchingUser } from '../utils/findMatchingUser';

describe('findMatchingUser', () => {
  const users = [
    {
      id: '1',
      phone_number: '+2348139781147',
      name: 'User One',
    },
    {
      id: '2',
      phone_number: '+2348151234567',
      name: 'User Two',
    },
  ];

  it('should return the user profile if a matching contact is found', () => {
    const contactDetails = [
      {
        number: '(0813) 978 1147',
      },
    ];

    const result = findMatchingUser(users, contactDetails);
    expect(result).toEqual({
      found: true,
      userProfile: users[0],
    });
  });

  it('should return the user profile if a matching contact is found with normalized number', () => {
    const contactDetails = [
      {
        number: '08151234567',
      },
    ];

    const result = findMatchingUser(users, contactDetails);
    expect(result).toEqual({
      found: true,
      userProfile: users[1],
    });
  });

  it('should return found: false if no matching contact is found', () => {
    const contactDetails = [
      {
        number: '08091234567',
      },
    ];

    const result = findMatchingUser(users, contactDetails);
    expect(result).toEqual({
      found: false,
      userProfile: null,
    });
  });

  it('should normalize the contact number and find the match', () => {
    const contactDetails = [
      {
        number: '08139781147',
      },
    ];

    const result = findMatchingUser(users, contactDetails);
    expect(result).toEqual({
      found: true,
      userProfile: users[0],
    });
  });

  it('should handle contact numbers with special characters', () => {
    const contactDetails = [
      {
        number: '+234-813-978-1147',
      },
    ];

    const result = findMatchingUser(users, contactDetails);
    expect(result).toEqual({
      found: true,
      userProfile: users[0],
    });
  });
});
