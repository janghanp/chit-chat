import React, { createContext, SetStateAction, useContext, useState } from "react";

import { CurrentUser } from "../types";

interface UserContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: React.Dispatch<SetStateAction<CurrentUser | null>>;
}

const userContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  return <userContext.Provider value={{ currentUser, setCurrentUser }}>{children}</userContext.Provider>;
};

export const useUser = () => {
  return useContext(userContext);
};
