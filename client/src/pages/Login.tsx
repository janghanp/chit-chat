import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const auth = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    auth.login(email, password, () => {
      navigate("/");
    });
  };

  console.log(auth.user);
  

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          className="border"
          id="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="border"
          id="password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">submit</button>
      </form>
    </div>
  );
};

export default Login;
