import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

const router = Router();

const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
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
				readBy: {
					set: [senderId],
				},
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

router.get('/', async (req: Request, res: Response) => {
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

// router.get('/:chatId', async (req: Request, res: Response) => {
// 	const { chatId } = req.params;

// 	try {
// 		const chat = await prisma.chat.findUnique({
// 			where: {
// 				id: chatId,
// 			},
// 			include: {
// 				messages: {
// 					include: {
// 						sender: true,
// 					},
// 					orderBy: {
// 						createdAt: 'desc',
// 					},
// 					take: 1,
// 				},
// 			},
// 		});

// 		const message = chat?.messages[0];

// 		if (message) {
// 			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// 			// @ts-ignore
// 			delete message.sender.password;
// 		}

// 		return res.status(200).json({ message });
// 	} catch (error) {
// 		console.log(error);

// 		return res.sendStatus(500);
// 	}
// });

export default router;
