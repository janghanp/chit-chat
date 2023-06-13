import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

import { PrismaClient } from '@prisma/client';
import { generateToken, verifyToken } from '../utils/token';
import { Email } from '../utils/email';
import { render } from '@react-email/render';

const router = Router();

const prisma = new PrismaClient();

router.post('/register', async (req: Request, res: Response) => {
    const { email, password, username }: { email: string; password: string; username: string } =
        req.body;

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
        const token = generateToken(username, email, user.id);

        // Set a cookie for 1 day
        res.cookie('token', token, {
            expires: new Date(Date.now() + 86400000),
            httpOnly: true,
        });

        return res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            Key: user.Key,
            hasNewNotification: false,
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
        const token = generateToken(user.username, user.email, user.id);

        // Set a cookie for 1 day
        res.cookie('token', token, {
            expires: new Date(Date.now() + 86400000),
            httpOnly: true,
        });

        return res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            Key: user.Key,
            hasNewNotification: false,
        });
    } catch (error) {
        console.log(error);

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
                const { username, email, id } = decodedToken;

                // Generate a new token
                const newToken = generateToken(username, email, id);

                // Find a user to get avatar_url and Key.
                const user = await prisma.user.findUnique({
                    where: {
                        email,
                    },
                });

                if (!user) {
                    return res
                        .status(500)
                        .json({ message: 'Somthing went wrong, please try again...' });
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
                    avatar_url: user.avatar_url,
                    Key: user.Key,
                    hasNewNotification: user.hasNewNotification,
                });
            }
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Somthing went wrong, please try again...' });
    }

    return res.sendStatus(204);
});

router.delete('/logout', (req: Request, res: Response) => {
    const token: string | null = req.cookies.token;

    if (token) {
        res.clearCookie('token');
    }

    return res.sendStatus(200);
});

router.post('/password_reset', async (req: Request, res: Response) => {
    const { email }: { email: string } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'No user found' });
        }

        const token = generateToken(user.username, user.email, user.id);

        const transporter = nodemailer.createTransport({
            service: 'naver',
            host: 'smtp.naver.com',
            port: 465,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        const emailHtml = render(
            Email({ url: `https://chitchat.lat/password_reset?token=${token}` })
        );

        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: '[Chit-chat] Please reset your password',
            html: emailHtml,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Somthing went wrong, please try again...' });
    }
});

router.get('/verify_token', async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token) {
        return res.status(500).json({ message: 'Somthing went wrong, please try again...' });
    }

    try {
        const decodedToken = verifyToken(token as string);

        return res.status(200).json(decodedToken);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Somthing went wrong, please try again...' });
    }
});

router.patch('/password', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    try {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(500).json({ message: 'Somthing went wrong, please try again...' });
        }

        await prisma.user.update({
            where: {
                email,
            },
            data: {
                password: hashedPassword,
            },
        });

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Somthing went wrong, please try again...' });
    }
});

export default router;
