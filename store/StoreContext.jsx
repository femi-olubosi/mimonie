import React, { createContext, useEffect, useState, useContext } from 'react';
import {
  fetchCurrUser,
  fetchUserProfile,
  getUserInfo,
} from '@/api/user.service';
import { DataStore } from 'aws-amplify/datastore';

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
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

  DataStore.start();

  const toggleMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    fetchCurrUser(setCurrentUser);
  }, []);

  useEffect(() => {
    fetchUserProfile(setUserProfile, currentUser);
  }, [currentUser]);

  const value = {
    isDarkMode,
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
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(StoreContext);
};

export { useGlobalContext, StoreProvider };
