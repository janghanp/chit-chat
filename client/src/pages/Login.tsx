import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:8080/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

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
