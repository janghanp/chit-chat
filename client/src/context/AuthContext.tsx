import axios from "axios";
import { useState, createContext, useContext, SetStateAction } from "react";

type AuthSuccessResponse = {
  email: string;
  username: string;
};

type AuthErrorResponse = {
  message: string;
};

interface AuthContextType {
  currentUser: { username: string; email: string };
  setCurrentUser: React.Dispatch<
    SetStateAction<{ username: string; email: string }>
  >;
  register: (
    email: string,
    password: string,
    username: string,
    callback: VoidFunction
  ) => Promise<AuthErrorResponse | null>;
  login: (
    email: string,
    password: string,
    callback: VoidFunction
  ) => Promise<AuthErrorResponse | null>;
  logout: (callback: VoidFunction) => void;
}

let authContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    email: string;
  }>({ username: "", email: "" });

  const register = async (
    email: string,
    password: string,
    username: string,
    callback: VoidFunction
  ): Promise<AuthErrorResponse | null> => {
    let errorFromServer = null;

    try {
      const { data } = await axios.post<AuthSuccessResponse>(
        "http://localhost:8080/register",
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

  const login = async (
    email: string,
    password: string,
    callback: VoidFunction
  ): Promise<AuthErrorResponse | null> => {
    let errorFromServer = null;

    try {
      const { data } = await axios.post<AuthSuccessResponse>(
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
      await axios.delete("http://localhost:8080/logout", {
        withCredentials: true,
      });

      callback();
    } catch (error) {
      console.log(error);
    }

    callback();
  };

  return (
    <authContext.Provider
      value={{ currentUser, setCurrentUser, register, login, logout }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(authContext);
};
