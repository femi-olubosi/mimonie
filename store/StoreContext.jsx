import React, { createContext, useEffect, useState, useContext } from 'react';
import { fetchCurrUser } from '@/api/user.service';

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [usernameVeri, setUsernameVeri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  const toggleMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    fetchCurrUser(setCurrentUser);
  }, []);

  const value = {
    isDarkMode,
    toggleMode,
    isLoading,
    setIsLoading,
    usernameVeri,
    setUsernameVeri,
    currentUser,
    setCurrentUser,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(StoreContext);
};

export { useGlobalContext, StoreProvider };
