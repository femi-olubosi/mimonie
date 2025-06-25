import { fetchUserConnections } from '../api/network.service';

export const listUserConnections = async (userId, setParsed) => {
  try {
    const response = await fetchUserConnections(userId);
    setParsed(response);
  } catch (err) {
    console.error(err);
  }
};
