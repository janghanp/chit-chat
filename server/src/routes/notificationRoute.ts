import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

const prisma = new PrismaClient();

const router = Router();

router.post('/', async (req: Request, res: Response) => {
	const { message, receiverId, senderId }: { receiverId: string; message: string; senderId: string } = req.body;

	try {
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
		});

		return res.status(200).json(notification);
	} catch (error) {
		console.log(error);

		return res.sendStatus(500);
	}
});

router.get('/', async (req: Request, res: Response) => {
	const { userId } = req.query;

	try {
		const notifications = await prisma.notification.findMany({
			where: {
				receiverId: userId as string,
			},
			include: {
				sender: {
					select: {
						avatar: true,
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

export default router;
