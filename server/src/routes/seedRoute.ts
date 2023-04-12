import { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const salt = bcrypt.genSaltSync(10);

const router = Router();

router.get('/', async (req: Request, res: Response) => {
	try {
		await prisma.message.deleteMany({ where: {} });
		await prisma.chat.deleteMany({ where: {} });
		await prisma.notification.deleteMany({ where: {} });
		await prisma.user.deleteMany({ where: {} });

		const users: { email: string; password: string; username: string; id?: string }[] = [];

		for (let i = 0; i < 5; i++) {
			const username = faker.name.firstName();

			const user = {
				email: faker.internet.email(),
				password: bcrypt.hashSync(username, salt),
				username,
			};

			users.push(user);
		}

		await prisma.user.createMany({ data: users });

		const user1 = await prisma.user.findFirst({
			where: {
				username: users[0].username,
			},
		});

		const user2 = await prisma.user.findFirst({
			where: {
				username: users[1].username,
			},
		});

		if (!user1 || !user2) {
			return;
		}

		const chat = await prisma.chat.create({
			data: {
				name: faker.lorem.word(),
				ownerId: user1.id,
				readBy: {
					set: [user1.id as string],
				},
				users: {
					connect: {
						id: user1.id,
					},
				},
			},
		});

		await prisma.chat.create({
			data: {
				name: faker.lorem.word(),
				ownerId: user2.id,
				readBy: {
					set: [user2.id as string],
				},
				users: {
					connect: {
						id: user2.id,
					},
				},
			},
		});

		const messages: { chatId: string; text: string; senderId: string; id?: string }[] = [];

		for (let i = 0; i < 50; i++) {
			const message = {
				chatId: chat.id,
				text: faker.lorem.text(),
				senderId: user1.id as string,
			};

			messages.push(message);
		}

		await prisma.message.createMany({ data: messages });

		const message = await prisma.message.findFirst({
			where: {
				text: messages[0].text,
			},
		});

		if (!message) {
			return;
		}

		await prisma.chat.update({
			where: {
				id: chat.id,
			},
			data: {
				messages: {
					connect: {
						id: message.id,
					},
				},
			},
		});

		const testUsers = await prisma.user.findMany({});
		const testChats = await prisma.chat.findMany({});
		const testMessages = await prisma.message.findMany({});

		return res.status(200).json({ testUsers, testChats, testMessages });
	} catch (error) {
		console.log(error);

		return res.status(500).json({ message: 'Something went wrong seeding data...' });
	}
});

export default router;
