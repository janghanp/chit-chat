import { Chat, Message, User, PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import cloudinary from 'cloudinary';
import multer from 'multer';

const prisma = new PrismaClient();

const uploader = multer({
	storage: multer.diskStorage({}),
	limits: { fieldSize: 1000000 },
});

const router = Router();

router.get('/', async (req: Request, res: Response) => {
	const { chatId } = req.query;

	try {
		const chat = await prisma.chat.findUnique({
			where: {
				id: chatId as string,
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

		if (!chat) {
			return res.status(400).json({ message: 'No chat found' });
		}

		const usersWithoutPassword = chat?.users.map((user) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			delete user.password;

			return user;
		});

		chat.users = usersWithoutPassword;

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

router.post('/', uploader.single('file'), async (req: Request, res: Response) => {
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

router.patch('/join', async (req: Request, res: Response) => {
	const { chatId, username } = req.body;

	try {
		let chatWithUsersAndMessages;
		let isNewMember = false;

		// Check if a user joined the room for the first time.
		const chat = await prisma.chat.findFirst({
			where: {
				AND: [
					{
						id: chatId,
					},
					{
						users: {
							some: {
								username: username,
							},
						},
					},
				],
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

		chatWithUsersAndMessages = chat;

		// A new member to the room.
		if (!chat) {
			// Connect a user to the existing chat.
			const updatedChat = await prisma.chat.update({
				where: {
					id: chatId,
				},
				data: {
					users: {
						connect: {
							username: username,
						},
					},
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

			chatWithUsersAndMessages = updatedChat;
			isNewMember = true;
		}

		chatWithUsersAndMessages?.users.forEach((user) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			delete user.password;

			return user;
		});

		return res.status(200).json({ isNewMember, chat: chatWithUsersAndMessages });
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.post('/message', async (req: Request, res: Response) => {
	const { chatId, text, senderId } = req.body;

	try {
		const message = await prisma.message.create({
			data: {
				chatId,
				text,
				senderId,
			},
		});

		await prisma.chat.update({
			where: {
				id: chatId,
			},
			data: {
				messages: {
					connect: {
						id: message.id,
					},
				},
			},
		});

		return res.status(200).json({ message });
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

export default router;
