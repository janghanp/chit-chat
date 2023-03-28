import { PrismaClient } from '@prisma/client';
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
	const { chatId, userId } = req.query;

	try {
		let chatWithUsersAndMessages;
		let isNewMember = false;

		// Check if a user joined the room for the first time.
		const chat = await prisma.chat.findFirst({
			where: {
				AND: [
					{
						id: chatId as string,
					},
					{
						users: {
							some: {
								id: userId as string,
							},
						},
					},
				],
			},
			include: {
				messages: {
					orderBy: {
						createdAt: 'asc',
					},
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
					id: chatId as string,
				},
				data: {
					users: {
						connect: {
							id: userId as string,
						},
					},
				},
				include: {
					messages: {
						orderBy: {
							createdAt: 'asc',
						},
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

router.get('/search', async (req: Request, res: Response) => {
	const { query } = req.query;

	try {
		const chats = await prisma.chat.findMany({
			where: {
				name: {
					contains: query as string,
				},
			},
			include: {
				users: true,
			},
		});

		return res.status(200).json(chats);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.get('/rooms', async (req: Request, res: Response) => {
	const { userId } = req.query;

	console.log(userId);

	try {
		const userWithChats = await prisma.user.findUnique({
			where: {
				id: userId as string,
			},
			include: {
				chats: {
					include: {
						messages: {
							take: 1,
							orderBy: {
								createdAt: 'desc',
							},
							include: {
								sender: true,
							},
						},
					},
				},
			},
		});

		if (!userWithChats) {
			return res.status(400).json({ message: 'No chat rooms found' });
		}

		return res.status(200).json({ chats: userWithChats?.chats });
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

		let newChat: any;

		if (req.file) {
			const upload = await cloudinary.v2.uploader.upload(req.file.path, { folder: '/chit-chat/icon' });

			const result = await prisma.chat.create({
				data: {
					name: roomName,
					ownerId,
					icon: upload.secure_url,
					public_id: upload.public_id,
				},
				include: {
					messages: true,
				},
			});

			newChat = result;
		} else {
			const result = await prisma.chat.create({ data: { name: roomName, ownerId }, include: { messages: true } });

			newChat = result;
		}

		await prisma.user.update({
			where: {
				id: ownerId,
			},
			data: {
				chats: {
					connect: {
						id: newChat.id,
					},
				},
			},
		});

		return res.status(200).json({ chat: newChat });
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
			include: {
				sender: true,
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

router.patch('/leave', async (req: Request, res: Response) => {
	const { chatId, userId } = req.body;

	try {
		await prisma.chat.update({
			where: {
				id: chatId,
			},
			data: {
				users: {
					disconnect: {
						id: userId,
					},
				},
			},
			include: {
				users: true,
			},
		});

		return res.sendStatus(200);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.get('/message/:chatId', async (req: Request, res: Response) => {
	const { chatId } = req.params;

	try {
		const chat = await prisma.chat.findUnique({
			where: {
				id: chatId,
			},
			include: {
				messages: {
					include: {
						sender: true,
					},
					orderBy: {
						createdAt: 'desc',
					},
					take: 1,
				},
			},
		});

		const message = chat?.messages[0];

		if (message) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			delete message.sender.password;
		}

		return res.status(200).json({ message });
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.delete('/:chatId', async (req: Request, res: Response) => {
	const { chatId } = req.params;

	try {
		await prisma.chat.delete({
			where: {
				id: chatId,
			},
		});

		return res.sendStatus(200);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.get('/messages', async (req: Request, res: Response) => {
	const { chatId, lastMessageId } = req.query;

	try {
		let messages;

		if (lastMessageId) {
			messages = await prisma.message.findMany({
				where: {
					chatId: chatId as string,
				},
				orderBy: {
					createdAt: 'desc',
				},
				cursor: {
					id: lastMessageId as string,
				},
				skip: 1,
				take: 10,
				include: {
					sender: true,
				},
			});
		} else {
			//first page
			messages = await prisma.message.findMany({
				where: {
					chatId: chatId as string,
				},
				orderBy: {
					createdAt: 'desc',
				},
				skip: 0,
				take: 10,
				include: {
					sender: true,
				},
			});
		}

		return res.status(200).json(messages);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

export default router;
