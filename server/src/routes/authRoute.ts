import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';

import { PrismaClient } from '@prisma/client';
import { generateToken, verifyToken } from '../utils/token';

const router = Router();

const prisma = new PrismaClient();

router.post('/register', async (req: Request, res: Response) => {
	const { email, password, username }: { email: string; password: string; username: string } = req.body;

	try {
		// Check if the email is already in use.
		const userWithEmail = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		// Check if the username is already in use.
		const userWithUsername = await prisma.user.findFirst({
			where: {
				username,
			},
		});

		if (userWithEmail) {
			return res.status(400).json({ message: 'This email is already in use.' });
		}

		if (userWithUsername) {
			return res.status(400).json({ message: 'This username is already in use.' });
		}

		// Hash password
		const salt = bcrypt.genSaltSync(10);
		const hashedPassword = bcrypt.hashSync(password, salt);

		// Create a user
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				username,
			},
			include: {
				chats: true,
			},
		});

		// Generate a token
		const token = generateToken(username, email);

		// Set a cookie for 1 day
		res.cookie('token', token, {
			expires: new Date(Date.now() + 86400000),
			httpOnly: true,
		});

		return res.status(200).json({
			id: user.id,
			username: user.username,
			email: user.email,
			avatar: user.avatar,
			public_id: user.public_id,
			chats: user.chats,
		});
	} catch (error) {
		return res.json({ message: 'Something went wrong, please try again...' });
	}
});

router.post('/login', async (req: Request, res: Response) => {
	const { email, password }: { email: string; password: string } = req.body;

	try {
		const user = await prisma.user.findUnique({
			where: {
				email,
			},
			include: {
				chats: true,
			},
		});

		if (!user) {
			return res.status(401).json({ message: 'Incorrect email address or password' });
		}

		// Compare passwords
		const isMatch = bcrypt.compareSync(password, user.password);

		if (!isMatch) {
			return res.status(401).json({ message: 'Incorrect email address or password' });
		}

		// Generate a token
		const token = generateToken(user.username, user.email);

		// Set a cookie for 1 day
		res.cookie('token', token, {
			expires: new Date(Date.now() + 86400000),
			httpOnly: true,
		});

		return res.status(200).json({
			id: user.id,
			username: user.username,
			email: user.email,
			avatar: user.avatar,
			public_id: user.public_id,
			chats: user.chats,
		});
	} catch (error) {
		return res.status(400).json({ message: 'Something went wrong, please try again...' });
	}
});

router.get('/refresh', async (req: Request, res: Response) => {
	const token: string | null = req.cookies.token;

	try {
		// Refresh page with a token.
		if (token) {
			const decodedToken = verifyToken(token);

			if (decodedToken) {
				const { username, email } = decodedToken;

				// Generate a new token
				const newToken = generateToken(username, email);

				// Find a user to get avatar and public_id.
				const user = await prisma.user.findUnique({
					where: {
						email,
					},
					include: {
						chats: true,
					},
				});

				if (!user) {
					return res.status(500).json({ message: 'Somthing went wrong, please try again...' });
				}

				// Set a cookie for 1 day
				res.cookie('token', newToken, {
					expires: new Date(Date.now() + 86400000),
					httpOnly: true,
				});

				return res.status(200).json({
					id: user.id,
					username: user.username,
					email: user.email,
					avatar: user.avatar,
					public_id: user.public_id,
					chats: user.chats,
				});
			}
		}
	} catch (error) {
		console.log(error);

		return res.status(500).json({ message: 'Somthing went wrong, please try again...' });
	}

	// Refresh page wihout a token
	return res.status(200).json({ status: 'ok' });
});

router.delete('/logout', (req: Request, res: Response) => {
	const token: string | null = req.cookies.token;

	if (token) {
		res.clearCookie('token');
	}

	res.end();
});

export default router;
