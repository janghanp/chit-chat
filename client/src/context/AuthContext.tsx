import axios from "axios";
import { useState, createContext, useContext, SetStateAction } from "react";

interface AuthContextType {
  currentUser: { username: string; email: string };
  setCurrentUser: React.Dispatch<
    SetStateAction<{ username: string; email: string }>
  >;
  login: (email: string, password: string, callback: VoidFunction) => void;
  logout: (callback: VoidFunction) => void;
}

const defaultValue = {
  currentUser: { username: "", email: "" },
  setCurrentUser: () => {},
  login: () => {},
  logout: () => {},
};

let authContext = createContext<AuthContextType>(defaultValue);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    email: string;
  }>({ username: "", email: "" });

  const login = async (
    email: string,
    password: string,
    callback: VoidFunction
  ) => {
    try {
      const { data } = await axios.post(
        "http://localhost:8080/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      setCurrentUser(data);
      callback();
    } catch (error) {
      console.log(error);
    }
  };

  const logout = (callback: VoidFunction) => {
    callback();
  };

  return (
    <authContext.Provider
      value={{ currentUser, setCurrentUser, login, logout }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(authContext);
};
