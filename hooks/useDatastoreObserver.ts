// hooks/useDataStoreObservers.ts
import { useEffect } from 'react';
import { DataStore } from 'aws-amplify/datastore';
import { fetchUserContributions } from '@/api/contributions.service';
import { Contribution, UserConnections } from '@/src/models';
import { listUserConnections } from '@/functions/connections';

interface UseDataStoreObserversProps {
  currentUser?: { userId: string };
  setContributions: (contributions: any[]) => void;
  setParsed: (connections: any[]) => void;
}

const useDataStoreObservers = ({
  currentUser,
  setContributions,
  setParsed,
}: UseDataStoreObserversProps) => {
  useEffect(() => {
    if (!currentUser?.userId) return;

    const subscription = DataStore.observe(Contribution).subscribe(() => {
      fetchUserContributions(currentUser?.userId, setContributions);
    });

    return () => subscription.unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.userId) return;

    const subscription = DataStore.observe(UserConnections).subscribe(() => {
      listUserConnections(currentUser?.userId, setParsed);
    });

    return () => subscription.unsubscribe();
  }, [currentUser]);
};

export default useDataStoreObservers;
