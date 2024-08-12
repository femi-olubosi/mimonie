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
    if (!currentUserProfile || !newConnectionProfile) {
      throw new Error('User profile not found');
    }

    // Create a new connection object

    // Update connections for both profiles
    await Promise.all([
      DataStore.save(
        UserProfile.copyOf(currentUserProfile, (updated) => {
          updated.connections = [...updated.connections, newConnection];
        })
      ),
      DataStore.save(
        UserProfile.copyOf(newConnectionProfile, (updated) => {
          updated.connections = [
            ...updated.connections,
            {
              userId: userProfile.userId,
              name: userProfile.name,
              phone_number: userProfile.phone_number,
              email: userProfile.email,
              occupation: userProfile.occupation,
              verified:
                userProfile.is_nin_verified && userProfile.is_bvn_verified,
              status: 'pending',
              type: 'request',
            },
          ];
        })
      ),
    ]);
  } catch (error) {
    console.error('Error updating user connections:', error);
    throw error;
  }
};
