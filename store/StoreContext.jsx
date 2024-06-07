import React, { createContext, useEffect, useState, useContext } from 'react';
import { fetchCurrUser, getUserInfo } from '@/api/user.service';

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [emailVeri, setEmailVeri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [userInfo, setUserInfo] = useState({});
  const [contributionGroups, setContributionGroups] = useState([]);
  const [contributions, setContributions] = useState([]);

  const toggleMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // useEffect(() => {
  //   fetchCurrUser(setCurrentUser);
  // }, []);

  const value = {
    isDarkMode,
    toggleMode,
    isLoading,
    setIsLoading,
    emailVeri,
    setEmailVeri,
    currentUser,
    setCurrentUser,
    userInfo,
    setUserInfo,
    contributionGroups,
    setContributionGroups,
    contributions,
    setContributions,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(StoreContext);
};

export { useGlobalContext, StoreProvider };
