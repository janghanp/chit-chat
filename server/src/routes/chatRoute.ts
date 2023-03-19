import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import cloudinary from 'cloudinary';
import multer from 'multer';
import { checkToken } from '../middleware/auth';

const prisma = new PrismaClient();

const uploader = multer({
	storage: multer.diskStorage({}),
	limits: { fieldSize: 1000000 },
});

const router = Router();

router.get('/', async (req: Request, res: Response) => {
	const { chatId } = req.query;

	try {
		// Check the presence of a chat room.
		const chat = await prisma.chat.findUnique({
			where: {
				id: chatId as string,
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

router.get('/name', async (req: Request, res: Response) => {
	const { chatName } = req.query;

	try {
		// Check the presence of a chat room.
		const chat = await prisma.chat.findUnique({
			where: {
				name: chatName as string,
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

// router.get('/messages', async (req: Request, res: Response) => {
// 	const { chatId } = req.query;

// 	try {
// 		const chat = await prisma.chat.findUnique({
// 			where: {
// 				name: chatId as string,
// 			},
// 			include: {
// 				messages: {
// 					include: {
// 						sender: true,
// 					},
// 				},
// 				users: true,
// 			},
// 		});

// 		const messages = chat?.messages;
// 		const users = chat?.users.map((user) => {
// 			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// 			// @ts-ignore
// 			delete user.password;
// 			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// 			// @ts-ignore
// 			delete user.createdAt;
// 			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// 			// @ts-ignore
// 			delete user.updatedAt;

// 			return user;
// 		});

// 		if (!chat) {
// 			return res.status(400).json({ message: 'No chat found' });
// 		}

// 		return res.status(200).json({ messages, users });
// 	} catch (error) {
// 		console.log(error);

// 		return res.sendStatus(500);
// 	}
// });

router.post('/', checkToken, uploader.single('file'), async (req: Request, res: Response) => {
	const { roomName, ownerId }: { roomName: string; ownerId: string } = req.body;

	try {
		// Check if a chat room to create already exists.
		const chat = await prisma.chat.findUnique({
			where: {
				name: roomName,
			},
		});

		if (chat) {
			return res.status(400).json({ message: 'The chatroom name already exists.' });
		}

		let chatId: string;

		if (req.file) {
			const upload = await cloudinary.v2.uploader.upload(req.file.path, { folder: '/chit-chat/icon' });

			const { id } = await prisma.chat.create({
				data: {
					name: roomName,
					ownerId,
					icon: upload.secure_url,
					public_id: upload.public_id,
				},
			});

			chatId = id;
		} else {
			const { id } = await prisma.chat.create({ data: { name: roomName, ownerId } });

			chatId = id;
		}

		return res.status(200).json({ chatId });
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});


export default router;
