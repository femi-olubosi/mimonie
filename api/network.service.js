import { UserProfile } from '@/src/models';
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
