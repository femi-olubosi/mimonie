import React, { createContext, useEffect, useState, useContext } from 'react';
import {
  fetchCurrUser,
  fetchUserProfile,
  getUserInfo,
} from '@/api/user.service';
import { DataStore, SortDirection } from 'aws-amplify/datastore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Contribution,
  UserActivity,
  UserConnections,
  UserNotifications,
  UserProfile,
} from '@/src/models';
import { getContacts } from '@/api/contact.service';
import {
  fetchUserContributions,
  fetchUserInvitedContributions,
} from '@/api/contributions.service';
import { fetchUserActivities } from '@/api/activities.service';
import { fetchUserNotification } from '@/api/notifications.service';
import { listUserConnections } from '@/functions/connections';

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [emailVeri, setEmailVeri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [contributionGroups, setContributionGroups] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [myContacts, setMyContacts] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [profilePicture, setProfilePicture] = useState('');
  const [inviteArray, setInviteArray] = useState([]);
  const [parsed, setParsed] = useState([]);
  const [hideValues, setHideValues] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [pilot, setPilot] = useState({
    account: true,
    network: true,
  });
  const [kycForm, setKycForm] = useState({});
  const [pushRoute, setPushRoute] = useState('/(protected)');
  const [isAuth, setIsAuth] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const toggleMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    fetchCurrUser(setCurrentUser);
  }, [isAuth]);

  useEffect(() => {
    const checkAuthState = async () => {
      const authValue = await AsyncStorage.getItem('isAuth');
      setIsAuth(authValue === 'true');
    };

    checkAuthState();
  }, []);

  const noAuth = async () => {
    setIsAuth(false);
    await AsyncStorage.removeItem('isAuth');
  };

  const yesAuth = async () => {
    setIsAuth(true);
    await AsyncStorage.setItem('isAuth', 'true');
  };

  const fetchData = async (user) => {
    try {
      await Promise.all([
        fetchUserProfile(setUserProfile, user),
        fetchUserContributions(user?.userId, setContributions, 50),
        fetchUserNotification(user?.userId, setNotifications, 20),
        listUserConnections(user?.userId, setParsed),
        getContacts().then(setMyContacts),
        fetchUserActivities(user?.userId, setUserActivities, 20),
        fetchUserInvitedContributions(user.userId, setInviteArray, 20),
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    const pullData = () => {
      DataStore.observeQuery(UserProfile, (u) =>
        u.userId.eq(currentUser?.userId)
      ).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;
        if (isSynced) {
          setUserProfile(items[0]);
        }
      });

      DataStore.observeQuery(
        Contribution,
        (c) =>
          c.and((c) => [
            c.participant_ids.notContains(currentUser?.userId),
            c.access.contains(currentUser?.userId),
          ]),
        {
          sort: (c) => c.createdAt(SortDirection.DESCENDING),
        }
      ).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;

        if (isSynced) {
          setInviteArray(items);
        }
      });

      DataStore.observeQuery(
        Contribution,
        (c) => c.participant_ids.contains(currentUser?.userId),
        {
          sort: (c) => c.createdAt(SortDirection.DESCENDING),
        }
      ).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;

        if (isSynced) {
          setContributions(items);
        }
      });

      DataStore.observeQuery(
        UserConnections,
        (c) =>
          c.or((c) => [
            c.senderId.eq(currentUser?.userId),
            c.receiverId.eq(currentUser?.userId),
          ]),
        {
          sort: (c) => c.createdAt(SortDirection.DESCENDING),
        }
      ).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;

        if (isSynced) {
          setParsed(items);
        }
      });

      DataStore.observeQuery(
        UserActivity,
        (a) => a.userId.eq(currentUser?.userId),
        {
          sort: (c) => c.createdAt(SortDirection.DESCENDING),
        }
      ).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;

        if (isSynced) {
          setUserActivities(items);
        }
      });

      DataStore.observeQuery(UserNotifications, (n) =>
        n.or((n) => [n.userId.eq(currentUser?.userId), n.type.eq('global')])
      ).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;

        if (isSynced) {
          setNotifications(items);
        }
      });
    };

    if (currentUser.userId) {
      pullData();
      fetchData(currentUser);
    }
  }, [currentUser]);

  const value = {
    darkMode,
    setDarkMode,
    toggleMode,
    isLoading,
    setIsLoading,
    emailVeri,
    setEmailVeri,
    currentUser,
    setCurrentUser,
    userProfile,
    setUserProfile,
    contributionGroups,
    setContributionGroups,
    contributions,
    setContributions,
    myContacts,
    setMyContacts,
    notifications,
    setNotifications,
    userActivities,
    setUserActivities,
    allUsers,
    setAllUsers,
    confirmationResult,
    setConfirmationResult,
    profilePicture,
    setProfilePicture,
    inviteArray,
    setInviteArray,
    parsed,
    setParsed,
    hideValues,
    setHideValues,
    updateAvailable,
    setUpdateAvailable,
    pilot,
    setPilot,
    kycForm,
    setKycForm,
    pushRoute,
    setPushRoute,
    isAuth,
    setIsAuth,
    noAuth,
    yesAuth,
    isReady,
    setIsReady,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(StoreContext);
};

export { useGlobalContext, StoreProvider };
