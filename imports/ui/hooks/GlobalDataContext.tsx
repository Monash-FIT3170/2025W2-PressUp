import React, { createContext, useContext } from "react";
import { useSubscribe } from "meteor/react-meteor-data";

interface GlobalContextType {
  isLoading: () => boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const globalLoading = useSubscribe();

  const isLoading = () => {
    return globalLoading();
  };

  return (
    <GlobalContext.Provider value={{ isLoading }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
