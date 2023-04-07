import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

const prisma = new PrismaClient();

const router = Router();

router.post('/', async (req: Request, res: Response) => {
	const { message, receiverId, senderId }: { receiverId: string; message: string; senderId: string } = req.body;

	try {
		const existingNotification = await prisma.notification.findFirst({
			where: {
				AND: [
					{
						senderId,
					},
					{
						receiverId,
					},
					{
						message: {
							contains: 'sent',
						},
					},
				],
			},
		});

		if (existingNotification) {
			return res.sendStatus(204);
		}

		const notification = await prisma.notification.create({
			data: {
				message,
				receiver: {
					connect: {
						id: receiverId,
					},
				},
				sender: {
					connect: {
						id: senderId,
					},
				},
			},
			include: {
				sender: {
					select: {
						avatar: true,
						username: true,
					},
				},
			},
		});

		await prisma.user.update({
			where: {
				id: receiverId,
			},
			data: {
				hasNewNotification: true,
			},
		});

		return res.status(200).json(notification);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.get('/all', async (req: Request, res: Response) => {
	const { userId } = req.query;

	try {
		const notifications = await prisma.notification.findMany({
			where: {
				receiverId: userId as string,
			},
			include: {
				sender: {
					select: {
						id: true,
						avatar: true,
						username: true,
					},
				},
			},
		});

		return res.status(200).json(notifications);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.delete('/', async (req: Request, res: Response) => {
	const { notificationId } = req.body;

	try {
		const notification = await prisma.notification.delete({
			where: {
				id: notificationId,
			},
			include: {
				sender: {
					select: {
						avatar: true,
						username: true,
					},
				},
			},
		});

		return res.status(200).json(notification);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.patch('/readAll', async (req: Request, res: Response) => {
	const { id } = req.token;

	try {
		await prisma.notification.updateMany({
			where: {
				receiverId: id,
			},
			data: {
				read: true,
			},
		});

		return res.sendStatus(200);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.patch('/read', async (req: Request, res: Response) => {
	const { notificationId } = req.body;

	try {
		await prisma.notification.update({
			where: {
				id: notificationId,
			},
			data: {
				read: true,
			},
		});

		return res.sendStatus(200);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

export default router;
