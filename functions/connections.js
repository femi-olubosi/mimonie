import { fetchUserConnections } from '../api/network.service';

export const listUserConnections = async (userId, setParsed) => {
  try {
    const response = await fetchUserConnections(userId);
    setParsed(response?.filter((e) => e.status === 'accepted'));
  } catch (err) {
    console.error(err);
  }
};
