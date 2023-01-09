import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { useAuth } from "../context/AuthContext";
import defaultImageUrl from "/default.jpg";
import axios from "axios";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
};
const Settings = () => {
  const auth = useAuth();

  const navigate = useNavigate();

  const [image, setImage] = useState<File | null>();
  const [preview, setPreview] = useState<string>();
  const [imageError, setImageError] = useState<string>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: auth.currentUser.email,
      username: auth.currentUser.username,
    },
  });

  // Upload an image when the image value is chagned.
  useEffect(() => {
    const uploadImage = async () => {
      const formData = new FormData();
      formData.append("file", image!);

      await axios.post("http://localhost:8080/profile", formData, {
        withCredentials: true,
      });
    };

    if (image && !imageError) {
      uploadImage();
    }
  }, [image]);

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
  });

  const changeFileHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];

    if (file) {
      if (file.size > 1000000) {
        setImageError("The image should be less than 1MB.");
        setPreview("");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        setImage(file);
        setPreview(reader.result as string);
        setImageError("");
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <img
        className="border"
        src={preview || defaultImageUrl}
        alt="avatar"
        width={50}
        height={50}
      />

      {imageError && <p>{imageError}</p>}

      <label>Your Image File</label>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/gif, image/jpeg, image/jpg, image/webp"
        onChange={changeFileHandler}
      />

      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input
          className="border disabled:text-gray-400 hover:cursor-not-allowed"
          disabled
          {...register("email", {
            required: { value: true, message: "Email is required" },
            pattern: {
              value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
              message: "Invalid email",
            },
          })}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email?.type === "taken" && (
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

        {errors.password?.type === "match" && (
          <p role="alert">{errors.password.message}</p>
        )}

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

        {errors.username?.type === "taken" && (
          <p role="alert">{errors.username.message}</p>
        )}

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Settings;
