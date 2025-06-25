import React, { createContext, useEffect, useState, useContext } from 'react';
import {
  fetchCurrUser,
  fetchUserProfile,
  getUserInfo,
} from '@/api/user.service';
import { DataStore } from 'aws-amplify/datastore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contribution, UserConnections } from '@/src/models';

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

  // useEffect(() => {
  //   if (isAuth) {
  //     if (userProfile?.name) return;
  //     fetchUserProfile(setUserProfile, currentUser);
  //   }
  // }, [currentUser, isAuth, userProfile]);

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

  useEffect(() => {
    if (!currentUser) return;
    DataStore.observeQuery(UserConnections).subscribe((snapshot) => {
      const { items, isSynced } = snapshot;
      setParsed(items);
      if (isSynced) {
        console.log('connections is fully synced! context');
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    DataStore.observeQuery(Contribution).subscribe((snapshot) => {
      const { items, isSynced } = snapshot;
      setContributions(items);
      if (isSynced) {
        console.log('contribution is fully synced! context');
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    DataStore.observeQuery(Contribution).subscribe((snapshot) => {
      const { items, isSynced } = snapshot;
      const invites = items.filter(
        (e) =>
          !e.participant_ids.includes(currentUser.userId) &&
          e.access.includes(currentUser.userId)
      );
      setInviteArray(invites);
      if (isSynced) {
        console.log('contribution is fully synced! context');
      }
    });
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
