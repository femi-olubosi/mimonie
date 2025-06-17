import { useEffect } from 'react';
import { Hub } from '@aws-amplify/core';

const useSyncListener = (setIsReady) => {
  useEffect(() => {
    const listener = Hub.listen('datastore', async ({ payload }) => {
      const { event } = payload;
      console.log('event', event);
      if (event === 'syncQueriesReady') {
        console.log('Yes ready');
        setIsReady(true);
      }
    });

    return () => listener();
  }, []);
};

export default useSyncListener;
