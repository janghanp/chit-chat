import axios from "axios";
import { useState, createContext, useContext } from "react";

interface AuthContextType {
  user: any;
  login: (email: string, password: string, callback: VoidFunction) => void;
  logout: (callback: VoidFunction) => void;
}

const defaultValue = {
  user: {},
  login: () => {},
  logout: () => {},
};

let authContext = createContext<AuthContextType>(defaultValue);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

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

      setUser(data);
      callback();
    } catch (error) {
      console.log(error);
    }
  };

  const logout = (callback: VoidFunction) => {
    callback();
  };

  return (
    <authContext.Provider value={{ user, login, logout }}>
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(authContext);
};
