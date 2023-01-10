import axios from "axios";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { AxiosResponseWithUser } from "../pages/Settings";

const AutoLogin = () => {
  const auth = useAuth();

  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

  useEffect(() => {
    //send a http request if the current jwt token in cookie is still valid
    const refresh = async () => {
      try {
        const { data } = await axios.get<AxiosResponseWithUser>("http://localhost:8080/auth/refresh", {
          withCredentials: true,
        });

        auth.setCurrentUser({
          username: data.username,
          email: data.email,
          avatar: data.avatar,
          public_id: data.public_id,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setIsAuthenticating(false);
      }
    };

    refresh();
  }, []);

  return <>{isAuthenticating ? <div>loading...</div> : <Outlet />}</>;
};

export default AutoLogin;
