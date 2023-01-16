import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

const router = Router();

const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  const { roomName } = req.query;

  try {
    // Check the presence of a chat room.
    const chat = await prisma.chat.findUnique({
      where: {
        name: roomName as string,
      },
    });

    if (!chat) {
      return res.status(400).json({ message: 'No chat room found' });
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.log(error);

    return res.sendStatus(500);
  }
});

router.get('/messages', async (req: Request, res: Response) => {
  const { roomName } = req.query;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        name: roomName as string,
      },
      include: {
        messages: {
          include: {
            sender: true,
          },
        },
      },
    });

    if (!chat) {
      return res.status(400).json({ message: 'No chat found' });
    }

    return res.status(200).json(chat.messages);
  } catch (error) {
    console.log(error);

    return res.sendStatus(500);
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { roomName }: { roomName: string } = req.body;

  try {
    // Check if a chat room to create already exists.
    const chat = await prisma.chat.findUnique({
      where: {
        name: roomName,
      },
    });

    if (chat) {
      return res.status(400).json({ message: 'Chat room already exists' });
    }

    // Create a chat.
    await prisma.chat.create({ data: { name: roomName } });

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);

    return res.sendStatus(500);
  }
});

export default router;
