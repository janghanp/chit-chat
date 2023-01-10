import { Request, Response, Router } from "express";
import { checkToken } from "../middleware/auth";
import cloudinary from "cloudinary";
import multer from "multer";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fieldSize: 1000000 },
});

const router = Router();

router.post("/profile", checkToken, uploader.single("file"), async (req: Request, res: Response) => {
  const { username, email } = req.token;

  if (!req.file) {
    return res.status(500).json({ message: "Something went wrong, please try again..." });
  }

  try {
    // Upload an image to cloudinary.
    const upload = await cloudinary.v2.uploader.upload(req.file.path);

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
    return res.status(500).json({ message: "Something went wrong, please try again..." });
  }
});

export default router;
