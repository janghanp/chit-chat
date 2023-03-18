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
				users: true,
			},
		});

		const messages = chat?.messages;
		const users = chat?.users.map((user) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			delete user.password;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			delete user.createdAt;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			delete user.updatedAt;

			return user;
		});

		if (!chat) {
			return res.status(400).json({ message: 'No chat found' });
		}

		return res.status(200).json({ messages, users });
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.post('/', checkToken, uploader.single('file'), async (req: Request, res: Response) => {
	const { roomName }: { roomName: string } = req.body;

	console.log(req.file);
	console.log(req.body);

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

		if (req.file) {
			const upload = await cloudinary.v2.uploader.upload(req.file.path, { folder: '/chit-chat/icon' });

			await prisma.chat.create({
				data: {
					name: roomName,
					icon: upload.secure_url,
					public_id: upload.public_id,
				},
			});
		} else {
			await prisma.chat.create({ data: { name: roomName } });
		}

		return res.sendStatus(200);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

// router.post('/icon', async (req: Request, res: Response) => {
// 	console.log('test');
// });

export default router;
