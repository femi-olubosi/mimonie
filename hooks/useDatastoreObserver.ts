import { useEffect } from 'react';
import { DataStore } from 'aws-amplify/datastore';
import { Contribution, UserConnections } from '@/src/models';

interface UseDataStoreObserversProps {
  currentUser?: { userId: string };
  setContributions: (contributions: any[]) => void;
  setParsed: (connections: any[]) => void;
  setInviteArray: (contributions: any[]) => void;
}

const useDataStoreObservers = ({
  currentUser,
  setParsed,
}: UseDataStoreObserversProps) => {
  // useEffect(() => {
  //   if (!currentUser?.userId) return;
  //   DataStore.observe(Contribution);
  // }, [currentUser]);
  // useEffect(() => {
  //   if (!currentUser?.userId || !setParsed) return;
  //   DataStore.observeQuery(UserConnections).subscribe((snapshot) => {
  //     const { items, isSynced } = snapshot;
  //     if (isSynced) {
  //       console.log('Data is fully synced! hook');
  //     }
  //   });
  // }, [currentUser]);
};

export default useDataStoreObservers;
