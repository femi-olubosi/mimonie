import { useEffect } from 'react';
import { DataStore } from '@aws-amplify/datastore';
import { Hub } from '@aws-amplify/core';

// export let currentUserId = null;

let currentUserId = null;

export const setCurrentUserId = (id) => {
  currentUserId = id;
};

export const getCurrentUserId = () => currentUserId;

const useAuthHubListener = () => {
  useEffect(() => {
    const listener = Hub.listen('auth', async ({ payload }) => {
      const { event, data } = payload;
      console.log(event, data);
      if (event === 'signedIn') {
        // currentUserId = data?.userId;
        setCurrentUserId(data?.userId);
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
