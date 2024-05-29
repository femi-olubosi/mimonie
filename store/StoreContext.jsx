import React, { createContext, useEffect, useState, useContext } from 'react';

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [usernameVeri, setUsernameVeri] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const value = {
    isDarkMode,
    toggleMode,
    isLoading,
    setIsLoading,
    usernameVeri,
    setUsernameVeri,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(StoreContext);
};

export { useGlobalContext, StoreProvider };
