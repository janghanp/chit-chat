import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { useAuth } from "../context/AuthContext";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

const Register = () => {
  const auth = useAuth();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = handleSubmit(async (data) => {
    const { email, password, confirmPassword, username } = data;

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      setError("password", {
        type: "match",
        message: "Passwords should match",
      });

      return;
    }

    const error = await auth.register(email, password, username, () => {
      navigate("/");
    });

    if (error) {
      if (error.message.includes("email")) {
        setError("email", { type: "taken", message: error.message });
      } else if (error.message.includes("username")) {
        setError("username", { type: "taken", message: error.message });
      }
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
        {errors.email?.type === "taken" && <p role="alert">{errors.email.message}</p>}
        <label>Password</label>
        <input
          className="border"
          type="password"
          {...register("password", {
            required: { value: true, message: "Password is required" },
          })}
        />

        {errors.password?.type === "match" && <p role="alert">{errors.password.message}</p>}

        <label>ConfirmPassword</label>
        <input
          className="border"
          type="password"
          {...register("confirmPassword", {
            required: { value: true, message: "Password is required" },
          })}
        />
        <label>Username</label>
        <input
          className="border"
          {...register("username", {
            required: { value: true, message: "Username is required" },
          })}
        />

        {errors.username?.type === "taken" && <p role="alert">{errors.username.message}</p>}

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Register;
