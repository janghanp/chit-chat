import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { useAuth } from "../context/AuthContext";

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const auth = useAuth();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = handleSubmit(async (data) => {
    const { email, password } = data;

    const error = await auth.login(email, password, () => {
      navigate("/");
    });

    // Set errors when failing to login with wrong credentials
    if (error) {
      setError("email", { type: "incorrect", message: error.message });
      setError("password", { type: "incorrect", message: error.message });
    }
  });

  if (auth.currentUser.email) {
    return <Navigate to={"/"}></Navigate>;
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input
          className="border"
          {...register("email", {
            required: { value: true, message: "Email is required" },
            pattern: {
              value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
              message: "Invalid email",
            },
          })}
          aria-invalid={errors.email ? "true" : "false"}
        />

        {errors.email?.type === "required" && (
          <p role="alert">{errors.email.message}</p>
        )}

        {errors.email?.type === "pattern" && (
          <p role="alert">{errors.email.message}</p>
        )}

        {errors.email?.type === "incorrect" && (
          <p role="alert">{errors.email.message}</p>
        )}

        <label>Password</label>
        <input
          className="border"
          type="password"
          {...register("password", {
            required: { value: true, message: "Password is required" },
          })}
        />

        {errors.password?.type === "required" && (
          <p role="alert">{errors.password.message}</p>
        )}

        {errors.password?.type === "incorrect" && (
          <p role="alert">{errors.password.message}</p>
        )}

        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default Login;
