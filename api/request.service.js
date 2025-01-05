import { DataStore } from 'aws-amplify/datastore';
import { Request } from '../src/models';

export const createRequest = async (data) => {
  try {
    await DataStore.save(new Request(data));

    return true;
  } catch (error) {
    console.error(error);
  }
};
