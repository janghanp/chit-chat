import { Request, Response, Router } from "express";
import { checkToken } from "../middleware/auth";
import cloudinary from "cloudinary";
import multer from "multer";
import bcrypt from "bcryptjs";

import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fieldSize: 1000000 },
});

const router = Router();

router.patch("/", checkToken, async (req: Request, res: Response) => {
  const { email } = req.token;
  const { newPassword, username } = req.body;

  try {
    let data: Prisma.UserUpdateInput = {};

    // Set new password to update.
    if (newPassword) {
      // Hash newPassword
      const salt = bcrypt.genSaltSync(10);
      const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

      data.password = hashedNewPassword;
    }

    //Check if the username is not taken.
    const foundUser = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (foundUser) {
      return res.status(400).json({ message: "This username is already in use." });
    }

    // Set username to update.
    if (username) {
      data.username = username;
    }

    const user = await prisma.user.update({
      where: {
        email,
      },
      data,
    });

    return res.status(200).json({ username: user.username });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Something went wrong, please try again..." });
  }
});

router.post("/profile", checkToken, uploader.single("file"), async (req: Request, res: Response) => {
  const { email } = req.token;
  const { public_id }: { public_id: string } = req.body;

  if (!req.file) {
    return res.status(500).json({ message: "Something went wrong, please try again..." });
  }

  try {
    // Delete a previous image from cloudinary.
    // The result is either { result: 'not found' } or { result: 'ok' }.
    if (public_id) {
      const result = await cloudinary.v2.uploader.destroy(public_id);

      console.log(result);
    }

    // Upload an image to cloudinary.
    const upload = await cloudinary.v2.uploader.upload(req.file.path, { folder: "/chit-chat/profile" });

    // Update a user with information from cloudinary.
    const user = await prisma.user.update({
      where: {
        email,
      },
      data: {
        avatar: upload.secure_url,
        public_id: upload.public_id,
      },
    });

    return res
      .status(200)
      .json({ email: user.email, username: user.username, avatar: user.avatar, public_id: user.public_id });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Something went wrong, please try again..." });
  }
});

export default router;
