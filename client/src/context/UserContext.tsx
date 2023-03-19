import React, { createContext, SetStateAction, useContext, useState } from 'react';

import { User } from '../types';

interface UserContextType {
	currentUser: User | null;
	setCurrentUser: React.Dispatch<SetStateAction<User | null>>;
}

const userContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	return <userContext.Provider value={{ currentUser, setCurrentUser }}>{children}</userContext.Provider>;
};

export const useUser = () => {
	return useContext(userContext);
};
