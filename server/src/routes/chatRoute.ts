import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";

const router = Router();

const prisma = new PrismaClient();

router.post("/", async (req: Request, res: Response) => {
  const { roomName }: { roomName: string } = req.body;

  try {
    // Create a chat.
    await prisma.chat.create({ data: { name: roomName } });

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);

    return res.sendStatus(500);
  }
});

export default router;
