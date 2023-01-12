import React, { createContext, SetStateAction, useContext, useState } from "react";

import { CurrentUser } from "../types";

interface UserContextType {
  currentUser: CurrentUser;
  setCurrentUser: React.Dispatch<SetStateAction<CurrentUser>>;
}

const userContext = createContext({} as UserContextType);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>({} as CurrentUser);

  return <userContext.Provider value={{ currentUser, setCurrentUser }}>{children}</userContext.Provider>;
};

export const useUser = () => {
  return useContext(userContext);
};
