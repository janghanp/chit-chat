import jwt from "jsonwebtoken";

export const generateToken = (username: string): string => {
  return jwt.sign({ username }, process.env.JWT_SECRET as string, {
    expiresIn: 60 * 60,
  });
};

export const verifyToken = () => {};
