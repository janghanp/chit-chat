import { Request, Response, Router } from 'express';
import cloudinary from 'cloudinary';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

import { exclude } from '../utils/exclude';
import { s3 } from '../utils/s3';

const prisma = new PrismaClient();

const uploader = multer({
    storage: multer.memoryStorage(),
    limits: { fieldSize: 1000000 },
});

const router = Router();

router.get('/username', async (req: Request, res: Response) => {
    const { username } = req.query;
    const { id } = req.token;

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                friends: {
                    where: {
                        username: username as string,
                    },
                },
            },
        });

        if (sender && sender.friends.length > 0) {
            return res.sendStatus(202);
        }

        const receiver = await prisma.user.findFirst({
            where: {
                username: username as string,
            },
        });

        if (!receiver) {
            return res.sendStatus(204);
        }

        exclude(receiver, ['password']);

        return res.status(200).json(receiver);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again...' });
    }
});

router.get('/friends', async (req: Request, res: Response) => {
    const { id } = req.token;

    try {
        const userWithFriends = await prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                friends: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        const friends = userWithFriends?.friends;

        return res.status(200).json(friends);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again...' });
    }
});

router.get('/chats', async (req: Request, res: Response) => {
    const { email } = req.token;

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
            return res.status(400).json({ message: 'No user found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again...' });
    }
});

router.get('/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again...' });
    }
});

router.patch('/', async (req: Request, res: Response) => {
    const { email } = req.token;
    const { newPassword, username } = req.body;

    try {
        const data: Prisma.UserUpdateInput = {};

        if (newPassword) {
            // Hash newPassword
            const salt = bcrypt.genSaltSync(10);
            const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

            // Set newPassword to update.
            data.password = hashedNewPassword;
        }

        if (username) {
            //Check if the username is not taken by other people except for the currentUser.
            const user = await prisma.user.findFirst({
                where: {
                    username,
                    NOT: {
                        email,
                    },
                },
            });

            if (user) {
                return res.status(400).json({ message: 'This username is already in use.' });
            }

            // Set username to update.
            data.username = username;
        }

        const user = await prisma.user.update({
            where: {
                email,
            },
            data,
        });

        return res.status(200).json({ username: user.username });
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again...' });
    }
});

router.post('/avatar', uploader.single('file'), async (req: Request, res: Response) => {
    const { email } = req.token;
    const { public_id }: { public_id: string } = req.body;

    if (!req.file) {
        return res.status(500).json({ message: 'Something went wrong, please try again...' });
    }

    try {
        // Delete a previous avatar from s3.
        if (public_id) {
            const input = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: public_id,
            };

            const deleteCommand = new DeleteObjectCommand(input);

            await s3.send(deleteCommand);
        }

        //Upload an image to s3
        const type = req.file.mimetype;
        const fileExtension = req.file.mimetype.split('/')[1];
        const Key = `${uuid()}.${fileExtension}`;

        const input = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `avatar/${Key}`,
            Body: req.file.buffer,
            ContentType: type,
        };

        const putCommand = new PutObjectCommand(input);

        await s3.send(putCommand);

        // Update a user with information from cloudinary.
        const user = await prisma.user.update({
            where: {
                email,
            },
            data: {
                avatar: `https://chit-chat-demo.s3.ap-southeast-2.amazonaws.com/${input.Key}`,
                public_id: input.Key,
            },
            include: {
                chats: true,
            },
        });

        return res.status(200).json({
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            public_id: user.public_id,
            chats: user.chats,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again...' });
    }
});

router.patch('/friend', async (req: Request, res: Response) => {
    const { senderId, receiverId } = req.body;

    try {
        await prisma.user.update({
            where: {
                id: senderId,
            },
            data: {
                friends: {
                    connect: {
                        id: receiverId,
                    },
                },
            },
        });

        await prisma.user.update({
            where: {
                id: receiverId,
            },
            data: {
                friends: {
                    connect: {
                        id: senderId,
                    },
                },
            },
        });

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again...' });
    }
});

router.patch('/notification', async (req: Request, res: Response) => {
    const { userId } = req.body;

    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                hasNewNotification: false,
            },
        });

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again...' });
    }
});

router.delete('/friend', async (req: Request, res: Response) => {
    const { senderId, receiverId } = req.body;

    try {
        await prisma.user.update({
            where: {
                id: senderId,
            },
            data: {
                friends: {
                    disconnect: {
                        id: receiverId,
                    },
                },
            },
        });

        await prisma.user.update({
            where: {
                id: receiverId,
            },
            data: {
                friends: {
                    disconnect: {
                        id: senderId,
                    },
                },
            },
        });

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again...' });
    }
});

export default router;
