import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import cloudinary from 'cloudinary';
import multer from 'multer';

import { exclude } from '../utils/exclude';

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
						createdAt: 'desc',
					},
					include: {
						sender: true,
					},
					take: 1,
				},
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
					readBy: {
						push: userId as string,
					},
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
					orderBy: {
						createdAt: 'asc',
					},
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

		// Filter left private chats out.
		const activeChats = userWithChats?.chats.filter((chat) => {
			return !userWithChats?.leftPrivateChatIds.includes(chat.id);
		});

		if (!userWithChats) {
			return res.status(400).json({ message: 'No chat rooms found' });
		}

		return res.status(200).json(activeChats);
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
	const { roomName, ownerId }: { roomName?: string; ownerId?: string } = req.body;

	try {
		// Check if a chat room to create already exists.
		const chat = await prisma.chat.findFirst({
			where: {
				name: roomName,
			},
		});

		if (chat) {
			return res.status(400).json({ message: 'The chatroom name already exists.' });
		}

		let newChat;

		if (req.file) {
			const upload = await cloudinary.v2.uploader.upload(req.file.path, { folder: '/chit-chat/icon' });

			const result = await prisma.chat.create({
				data: {
					name: roomName,
					ownerId,
					icon: upload.secure_url,
					public_id: upload.public_id,
					readBy: {
						set: [ownerId as string],
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
					readBy: {
						set: [ownerId as string],
					},
				},
				include: { messages: true },
			});

			newChat = result;
		}

		return res.status(200).json(newChat);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.patch('/leave', async (req: Request, res: Response) => {
	const { chatId, userId } = req.body;

	try {
		const chat = await prisma.chat.findUnique({
			where: {
				id: chatId,
			},
		});

		if (chat?.type === 'GROUP') {
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
		}

		if (chat?.type === 'PRIVATE') {
			await prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					leftPrivateChatIds: {
						push: chatId,
					},
				},
			});
		}

		return res.sendStatus(200);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.delete('/', async (req: Request, res: Response) => {
	const { chatId } = req.body;

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

router.post('/private', async (req: Request, res: Response) => {
	const { senderId, receiverId }: { senderId?: string; receiverId?: string } = req.body;

	try {
		//Check if there is already a private chat between users.
		const previousChat = await prisma.chat.findFirst({
			where: {
				AND: [
					{ name: null },
					{ icon: null },
					{ users: { some: { id: senderId as string } } },
					{ users: { some: { id: receiverId as string } } },
				],
			},
			include: {
				messages: {
					include: {
						sender: true,
					},
				},
			},
		});

		if (previousChat) {
			return res.status(200).json({ previousChat, isPrevious: true });
		}

		// Create a private chat.
		const privateChat = await prisma.chat.create({
			data: {
				type: 'PRIVATE',
				users: {
					connect: [{ id: senderId }, { id: receiverId }],
				},
			},
			include: {
				messages: {
					include: {
						sender: true,
					},
				},
			},
		});

		// Not showing the private chat initially to the receiver.
		await prisma.user.update({
			where: {
				id: receiverId,
			},
			data: {
				leftPrivateChatIds: {
					push: privateChat.id,
				},
			},
		});

		return res.status(200).json(privateChat);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.get('/private', async (req: Request, res: Response) => {
	const { chatId, userId } = req.query;

	try {
		const chatWithReciver = await prisma.chat.findUnique({
			where: {
				id: chatId as string,
			},
			select: {
				users: {
					where: {
						NOT: {
							id: userId as string,
						},
					},
				},
			},
		});

		return res.status(200).json(chatWithReciver?.users[0]);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.patch('/read', async (req: Request, res: Response) => {
	const { chatId, userId } = req.body;

	try {
		const chat = await prisma.chat.findUnique({
			where: {
				id: chatId,
			},
		});

		if (chat) {
			const newReadBy = chat?.readBy;

			if (!chat.readBy.includes(userId as string)) {
				newReadBy.push(userId as string);
			}

			await prisma.chat.update({
				where: {
					id: chatId,
				},
				data: {
					readBy: newReadBy,
				},
			});

			return res.sendStatus(200);
		}
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

export default router;
