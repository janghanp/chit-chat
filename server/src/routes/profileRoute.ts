import { Request, Response, Router } from "express";
import { checkToken } from "../middleware/auth";
import cloudinary from "cloudinary";
import multer from "multer";

const uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fieldSize: 1000000 },
});

const router = Router();

//TODO: Checking jwt token with middleware.

router.post(
  "/profile",
  checkToken,
  uploader.single("file"),
  async (req: Request, res: Response) => {
    const { username, email } = req.token;

    try {
      // Upload an image to cloudinary
      if (req.file) {
        const upload = await cloudinary.v2.uploader.upload(req.file.path);

        console.log(upload);
      }
    } catch (error) {
      console.log(error);

      return res
        .status(500)
        .json({ message: "Something went wrong, please try again..." });
    }
  }
);

export default router;
