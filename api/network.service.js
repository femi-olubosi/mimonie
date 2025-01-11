import { UserConnections, UserProfile } from '@/src/models';
import { DataStore } from 'aws-amplify/datastore';

export const updateUserConnections = async (newConnection, userProfile) => {
  try {
    // Fetch both user profiles in parallel
    const [currentUserProfile, newConnectionProfile] = await Promise.all([
      DataStore.query(UserProfile, (c) => c.userId.eq(userProfile.userId)),
      DataStore.query(UserProfile, (c) => c.userId.eq(newConnection.userId)),
    ]);

    // Check if both profiles exist
    if (!currentUserProfile[0] || !newConnectionProfile[0]) {
      throw new Error('User profile not found');
    }

    const currentConnections = JSON.parse(
      currentUserProfile[0].connections || '[]'
    );
    const otherConnections = JSON.parse(
      newConnectionProfile[0].connections || '[]'
    );

    currentConnections.push(newConnection);

    otherConnections.push({
      userId: userProfile?.userId,
      name: userProfile?.name,
      phone_number: userProfile?.phone_number,
      email: userProfile?.email,
      occupation: userProfile?.occupation,
      push_token: userProfile?.push_token,
      verified: userProfile.is_nin_verified && userProfile.is_bvn_verified,
      status: 'pending',
      type: 'request',
    });

    await Promise.all([
      DataStore.save(
        UserProfile.copyOf(currentUserProfile[0], (updated) => {
          updated.connections = JSON.stringify(currentConnections);
        })
      ),
      DataStore.save(
        UserProfile.copyOf(newConnectionProfile[0], (updated) => {
          updated.connections = JSON.stringify(otherConnections);
        })
      ),
    ]);
  } catch (error) {
    console.error('Error updating user connections:', error);
    throw error;
  }
};

const saveUpdatedProfiles = async (data, userProfile) => {
  try {
    const currUserProfile = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(userProfile.userId)
    );
    const otherUserProfile = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(data.userId)
    );

    if (!currUserProfile || !otherUserProfile) {
      throw new Error('User profile not found');
    }

    const currentConnections = JSON.parse(
      currUserProfile[0].connections || '[]'
    );
    const otherConnections = JSON.parse(
      otherUserProfile[0].connections || '[]'
    );

    const updatedConnections = currentConnections.filter(
      (connection) => connection.userId !== data.userId
    );

    // Filter out the pending connection request from the other user's connections
    const updatedOtherConnections = otherConnections.filter(
      (connection) => connection.userId !== userProfile.userId
    );

    await Promise.all([
      DataStore.save(
        UserProfile.copyOf(currUserProfile[0], (updated) => {
          updated.connections = JSON.stringify(updatedConnections);
        })
      ),
      DataStore.save(
        UserProfile.copyOf(otherUserProfile[0], (updated) => {
          updated.connections = JSON.stringify(updatedOtherConnections);
        })
      ),
    ]);
  } catch (error) {
    console.error('Error removing connection request:', error);
  }
};

export const removeConnection = async (data, userProfile) => {
  await saveUpdatedProfiles(data, userProfile);
};

export const acceptConnectionRequest = async (data, userProfile) => {
  try {
    const currentUserProfile = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(userProfile.userId)
    );
    const otherUserProfile = await DataStore.query(UserProfile, (c) =>
      c.userId.eq(data.userId)
    );

    if (!currentUserProfile || !otherUserProfile) {
      throw new Error('User profile not found');
    }

    const currentConnections = JSON.parse(
      currentUserProfile[0].connections || '[]'
    );
    const otherConnections = JSON.parse(
      otherUserProfile[0].connections || '[]'
    );

    const updatedConnections = currentConnections.map((connection) => {
      if (connection.userId === data.userId) {
        connection.status = 'accepted';
      }
      return connection;
    });
    const updatedOtherConnections = otherConnections.map((connection) => {
      if (connection.userId === userProfile.userId) {
        connection.status = 'accepted';
      }
      return connection;
    });

    await Promise.all([
      DataStore.save(
        UserProfile.copyOf(currentUserProfile[0], (updated) => {
          updated.connections = JSON.stringify(updatedConnections);
        })
      ),
      DataStore.save(
        UserProfile.copyOf(otherUserProfile[0], (updated) => {
          updated.connections = JSON.stringify(updatedOtherConnections);
        })
      ),
    ]);
  } catch (error) {
    console.error('Error accepting connection request:', error);
  }
};

export const rejectConnectionRequest = async (data, userProfile) => {
  await saveUpdatedProfiles(data, userProfile);
};

export const undoRequest = async (data, userProfile) => {
  await saveUpdatedProfiles(data, userProfile);
};

// export const createConnection = async () => {
//   const senderDetails = {
//     "occupation": "Electrical Engineering",
//   "name": "ONYEBUCHI PHILIP OZUNGWA",
//   "verified": true,
//   "invites": ["c353378a-8ea5-4832-aa4c-84ce8209df22"],
//   "phone_number": "+2347035842750",
//   "type": "user",
//   "userId": "78714350-c0a1-70e4-695a-6d13475a98e7",
//   "email": "ozungwao@gmail.com",
//   "push_token": "ExponentPushToken[Kbu1QVPk-QfY-qSIYhaQOY]",
//     income_from: 100000,
//   };

//   const receiverDetails = {
//     income_from: 750000,
//     occupation: 'Secretary',
//     name: 'Gloria Joseph',
//     verified: true,
//     phoneNumber: '+2348141861543',
//     userId: '18d1c320-6001-70cf-e7a5-fccdc5d0fe82',
//     email: 'josephgloria67@gmail.com',
//     pushToken: 'ExponentPushToken[zwx-EFOdwp5ArvVOZmu9P9]',
//     invites: null,
//   };

//   const data = {
//     senderId: senderDetails.userId,
//     receiverId: receiverDetails.userId,
//     status: 'pending',
//     senderDetails,
//     receiverDetails,
//   };

//   try {
//     // Save the connection to DataStore
//     const result = await DataStore.save(new UserConnections(data));
//     console.log('Connection saved:', result);
//     return true;
//   } catch (error) {
//     console.error('Error saving connection:', error);
//     return false;
//   }
// };

export const createConnection = async (userProfile, connectDetails) => {
  const senderDetails = {
    occupation: userProfile.occupation,
    name: userProfile.name,
    verified:
      connectDetails.is_bvn_verified &&
      connectDetails.is_nin_verified &&
      connectDetails.phone_verified,
    phone_number: userProfile.phone_number,
    userId: userProfile.userId,
    email: userProfile.email,
    push_token: userProfile.push_token,
    income_from: userProfile.income_from,
    invites: null,
  };

  const receiverDetails = {
    occupation: connectDetails.occupation,
    name: connectDetails.name,
    verified:
      connectDetails.is_bvn_verified &&
      connectDetails.is_nin_verified &&
      connectDetails.phone_verified,
    phone_number: connectDetails.phone_number,
    userId: connectDetails.userId,
    email: connectDetails.email,
    push_token: connectDetails.push_token,
    income_from: connectDetails.income_from,
    invites: null,
  };

  const data = {
    senderId: userProfile.userId,
    receiverId: connectDetails.userId,
    status: 'pending',
    senderDetails,
    receiverDetails,
  };

  try {
    const result = await DataStore.save(new UserConnections(data));
    console.log('Connection saved:', result);
    return true;
  } catch (error) {
    console.error('Error saving connection:', error);
    return false;
  }
};

export const fetchUserConnections = async (userId) => {
  try {
    const userConnections = await DataStore.query(UserConnections, (c) =>
      c.or((condition) => [
        condition.senderId.eq(userId),
        condition.receiverId.eq(userId),
      ])
    );

    return userConnections;
  } catch (error) {
    console.error('Error fetching user connections:', error);
    return [];
  }
};

export const removeUserConnection = async (connectionId) => {
  try {
    const connection = await DataStore.query(UserConnections, connectionId);

    if (connection) {
      await DataStore.delete(connection);
      console.log('Connection removed successfully:', connectionId);
      return true;
    } else {
      console.error('Connection not found:', connectionId);
      return false;
    }
  } catch (error) {
    console.error('Error removing connection:', error);
    return false;
  }
};

// Update connection status
export const updateUserConnection = async (connectionId) => {
  try {
    const connection = await DataStore.query(UserConnections, connectionId);

    if (connection) {
      const updatedConnection = await DataStore.save(
        UserConnections.copyOf(connection, (updated) => {
          updated.status = 'accepted';
        })
      );
      console.log('Connection updated successfully:', updatedConnection);
      return true;
    } else {
      console.error('Connection not found:', connectionId);
      return false;
    }
  } catch (error) {
    console.error('Error updating connection:', error);
    return false;
  }
};
