import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthStatus = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth.user) {
    return <p>You are not logged in.</p>;
  }

  return (
    <p>
      Welcome {auth.user}!{" "}
      <button
        onClick={() => {
          auth.logout(() => navigate("/"));
        }}
      >
        Sign out
      </button>
    </p>
  );
};

export default AuthStatus;
