import { useEffect } from 'react';
import { Hub } from '@aws-amplify/core';

const useSyncListener = (setIsReady: any) => {
  useEffect(() => {
    const listener = Hub.listen('datastore', async ({ payload }) => {
      const { event } = payload;
      if (event === 'syncQueriesReady') {
        setIsReady(true);
      }
    });

    return () => listener();
  }, []);
};

export default useSyncListener;
