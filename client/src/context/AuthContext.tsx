import axios from "axios";
import { useState, createContext, useContext, SetStateAction } from "react";

interface AuthSuccessResponse {
  email: string;
  username: string;
}

export interface AuthErrorResponse {
  message: string;
}
// When a user creates an account for the first time, they don't have an avatar and public_id valuse.
interface currentUserType {
  username: string;
  email: string;
  avatar?: string;
  public_id?: string;
}

interface AuthContextType {
  currentUser: currentUserType;
  setCurrentUser: React.Dispatch<SetStateAction<currentUserType>>;
  register: (
    email: string,
    password: string,
    username: string,
    callback: VoidFunction
  ) => Promise<AuthErrorResponse | null>;
  login: (email: string, password: string, callback: VoidFunction) => Promise<AuthErrorResponse | null>;
  logout: (callback: VoidFunction) => void;
}

let authContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<currentUserType>({} as currentUserType);

  const register = async (
    email: string,
    password: string,
    username: string,
    callback: VoidFunction
  ): Promise<AuthErrorResponse | null> => {
    let errorFromServer = null;

    try {
      const { data } = await axios.post<AuthSuccessResponse>(
        "http://localhost:8080/auth/register",
        {
          email,
          password,
          username,
        },
        { withCredentials: true }
      );

      setCurrentUser(data);
      callback();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        errorFromServer = error.response!.data as AuthErrorResponse;
      } else if (error instanceof Error) {
        console.log(error);
      }
    }

    return errorFromServer;
  };

  const login = async (email: string, password: string, callback: VoidFunction): Promise<AuthErrorResponse | null> => {
    let errorFromServer = null;

    try {
      const { data } = await axios.post<AuthSuccessResponse>(
        "http://localhost:8080/auth/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      setCurrentUser(data);
      callback();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        errorFromServer = error.response!.data as AuthErrorResponse;
      } else if (error instanceof Error) {
        console.log(error);
      }
    }

    return errorFromServer;
  };

  const logout = async (callback: VoidFunction) => {
    try {
      await axios.delete("http://localhost:8080/auth/logout", {
        withCredentials: true,
      });
    } catch (error) {
      console.log(error);
    } finally {
      callback();
    }
  };

  return (
    <authContext.Provider value={{ currentUser, setCurrentUser, register, login, logout }}>
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(authContext);
};
