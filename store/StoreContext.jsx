import React, { createContext, useEffect, useState, useContext } from 'react';
import {
  fetchCurrUser,
  fetchUserProfile,
  getUserInfo,
} from '@/api/user.service';
import { DataStore } from 'aws-amplify/datastore';
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
      DataStore.observeQuery(UserProfile).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;

        if (isSynced) {
          const profile = items.find((e) => e.userId === currentUser.userId);
          setUserProfile(profile);
        }
      });

      DataStore.observeQuery(Contribution).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;

        if (isSynced) {
          const invites = items.filter(
            (e) =>
              !e.participant_ids.includes(currentUser.userId) &&
              e.access.includes(currentUser.userId)
          );
          setInviteArray(invites);
        }
      });

      DataStore.observeQuery(Contribution).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;

        if (isSynced) {
          const contriList = items.filter((e) =>
            e.participant_ids.includes(currentUser.userId)
          );
          setContributions(contriList);
        }
      });

      DataStore.observeQuery(UserConnections).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;

        if (isSynced) {
          const connectList = items.filter(
            (e) =>
              e.senderId.includes(currentUser.userId) ||
              e.receiverId.includes(currentUser.userId)
          );
          setParsed(connectList);
        }
      });

      DataStore.observeQuery(UserActivity).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;

        if (isSynced) {
          const activities = items.filter(
            (e) => e.userId === currentUser.userId
          );
          setUserActivities(activities);
        }
      });

      DataStore.observeQuery(UserNotifications).subscribe((snapshot) => {
        const { items, isSynced } = snapshot;

        if (isSynced) {
          const notificationList = items.filter(
            (e) => e.userId === currentUser.userId || e.type === 'global'
          );
          setNotifications(notificationList);
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
