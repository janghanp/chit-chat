import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import cloudinary from 'cloudinary';
import multer from 'multer';

// Exclude keys from user
function exclude<User, Key extends keyof User>(user: User, keys: Key[]): Omit<User, Key> {
	for (const key of keys) {
		delete user[key];
	}
	return user;
}

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
			// include: {
			// 	messages: {
			// 		orderBy: {
			// 			createdAt: 'desc',
			// 		},
			// 		include: {
			// 			sender: true,
			// 		},
			// 		take: 1,
			// 	},
			// },
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
							createdAt: 'desc',
						},
						include: {
							sender: true,
						},
						take: 1,
					},
				},
			});

			chatWithUsersAndMessages = updatedChat;
			isNewMember = true;
		}

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

		return res.status(200).json(userWithChats.chats);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.get('/name', async (req: Request, res: Response) => {
	const { chatName } = req.query;

	try {
		// Check the presence of a chat room.
		const chat = await prisma.chat.findFirst({
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
	const { roomName, ownerId, receiverId }: { roomName?: string; ownerId?: string; receiverId?: string } = req.body;

	try {
		// Check if a chat room to create already exists.
		if (roomName && ownerId) {
			const chat = await prisma.chat.findFirst({
				where: {
					name: roomName,
				},
			});

			if (chat) {
				return res.status(400).json({ message: 'The chatroom name already exists.' });
			}
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
					users: {
						connect: {
							id: req.token.id,
						},
					},
				},
				include: {
					messages: true,
				},
			});

			newChat = result;
		} else {
			const result = await prisma.chat.create({
				data: {
					name: roomName,
					ownerId,
					users: {
						connect: {
							id: req.token.id,
						},
					},
				},
				include: { messages: true },
			});

			newChat = result;
		}

		if (receiverId) {
			await prisma.chat.update({
				where: {
					id: newChat.id,
				},
				data: {
					users: {
						connect: {
							id: receiverId,
						},
					},
				},
			});
		}

		return res.status(200).json(newChat);
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
		const chat = await prisma.chat.delete({
			where: {
				id: chatId,
			},
		});

		if (chat && chat.public_id) {
			await cloudinary.v2.uploader.destroy(chat.public_id);
		}

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
				take: 20,
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
				take: 20,
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

router.get('/members', async (req: Request, res: Response) => {
	const { chatId } = req.query;

	try {
		const chat = await prisma.chat.findUnique({
			where: {
				id: chatId as string,
			},
			include: {
				users: true,
			},
		});

		chat?.users.forEach((user) => {
			exclude(user, ['password']);
		});

		return res.status(200).json(chat?.users);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.patch('/', uploader.single('file'), async (req: Request, res: Response) => {
	const { roomName, chatId }: { roomName: string; chatId: string } = req.body;
	console.log(roomName, chatId);

	try {
		const chat = await prisma.chat.findFirst({
			where: {
				AND: [
					{
						name: roomName,
					},
					{
						NOT: {
							id: chatId,
						},
					},
				],
			},
		});

		console.log(chat);

		if (chat) {
			return res.status(400).json({ message: 'The chatroom is being used by someone' });
		}

		const currentChat = await prisma.chat.findUnique({
			where: {
				id: chatId,
			},
		});

		if (currentChat) {
			// Delete the existing image from cloudinary.
			if (currentChat.public_id) {
				await cloudinary.v2.uploader.destroy(currentChat.public_id);
			}

			if (req.file) {
				// Upload a new image.
				const upload = await cloudinary.v2.uploader.upload(req.file.path, { folder: '/chit-chat/icon' });

				await prisma.chat.update({
					where: {
						id: chatId,
					},
					data: {
						name: roomName,
						icon: upload.secure_url,
						public_id: upload.public_id,
					},
				});
			} else {
				await prisma.chat.update({
					where: {
						id: chatId,
					},
					data: {
						name: roomName,
						public_id: null,
						icon: null,
					},
				});
			}
		}

		return res.sendStatus(200);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.get('/private', async (req: Request, res: Response) => {
	const { senderId, receiverId } = req.query;

	try {
		const chat = await prisma.chat.findFirst({
			where: {
				AND: [
					{ name: null },
					{ icon: null },
					{ users: { some: { id: senderId as string } } },
					{ users: { some: { id: receiverId as string } } },
				],
			},
		});

		return res.status(200).json(chat);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

export default router;
