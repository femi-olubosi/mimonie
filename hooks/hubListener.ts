import { useEffect } from 'react';
import { DataStore } from '@aws-amplify/datastore';
import { Hub } from '@aws-amplify/core';

export let userId = null;

const useAuthHubListener = () => {
  useEffect(() => {
    const listener = Hub.listen('auth', async ({ payload }) => {
      const { event, data } = payload;
      if (event === 'signedIn') {
        userId = data?.userId;
        await DataStore.start();
        console.log('first observer started');
      }
      if (event === 'signedOut') {
        await DataStore.clear();
        console.log('first observer cleared');
      }
    });

    return () => listener();
  }, []);
};

export default useAuthHubListener;
