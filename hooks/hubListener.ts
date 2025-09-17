import { useEffect } from 'react';
import { DataStore } from '@aws-amplify/datastore';
import { Hub } from '@aws-amplify/core';

// export let currentUserId = null;

let currentUserId: string | null = null;

export const setCurrentUserId = (id: string) => {
  currentUserId = id;
};

export const getCurrentUserId = () => currentUserId;

const useAuthHubListener = () => {
  useEffect(() => {
    const listener = Hub.listen('auth', async ({ payload }) => {
      const { event, data } = payload;
      if (event === 'signedIn') {
        setCurrentUserId(data?.userId);
        await DataStore.start();
      }
      if (event === 'signedOut') {
        await DataStore.clear();
      }
    });

    return () => listener();
  }, []);
};

export default useAuthHubListener;
