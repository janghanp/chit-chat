import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/token";

const router = Router();

const prisma = new PrismaClient();

router.post("/register", async (req: Request, res: Response) => {
  const {
    email,
    password,
    username,
  }: { email: string; password: string; username: string } = req.body;

  try {
    // Check if the email is already in use.
    const userWithEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const userWithUsername = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (userWithEmail) {
      return res.status(400).json({ message: "The email is already in use." });
    }

    if (userWithUsername) {
      return res
        .status(400)
        .json({ message: "The username is already in use." });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create a user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    // Generate a token
    const token = generateToken(username);

    return res.status(200).json({ token });
  } catch (error) {
    return res.json({ message: "Something went wrong, please try again..." });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Incorrect email address or password" });
    }

    // Compare passwords
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect email address or password" });
    }

    // Generate a token
    const token = generateToken(user.username);

    res.cookie("token", token, { httpOnly: true });

    return res.status(200).json({ token });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Something went wrong, please try again..." });
  }
});

export default router;
