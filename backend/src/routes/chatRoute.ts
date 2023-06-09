import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import multer from 'multer';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

import { exclude } from '../utils/exclude';
import { s3 } from '../utils/s3';

const prisma = new PrismaClient();

const uploader = multer({
    storage: multer.memoryStorage(),
    limits: { fieldSize: 1000000 },
});

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const userId = req.token.id;
    const { chatId } = req.query;

    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId as string,
            },
        });

        if (!chat) {
            return res.status(400).json({ message: 'No chat rooms found' });
        }

        let chatWithUsersAndMessages;
        let isNewMember = false;

        // Check if a user joined the chat for the first time.
        const existingChat = await prisma.chat.findFirst({
            where: {
                AND: [
                    {
                        id: chatId as string,
                    },
                    {
                        users: {
                            some: {
                                id: userId,
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
                users:
                    chat.type === 'GROUP'
                        ? false
                        : {
                              where: {
                                  NOT: {
                                      id: userId,
                                  },
                              },
                              select: {
                                  id: true,
                                  username: true,
                                  avatar_url: true,
                              },
                          },
            },
        });

        chatWithUsersAndMessages = existingChat;

        // A new member to the chat.
        // Connect the user to the chat.
        if (!existingChat) {
            // Connect a user to the existing chat.
            const updatedChat = await prisma.chat.update({
                where: {
                    id: chatId as string,
                },
                data: {
                    readBy: {
                        push: userId,
                    },
                    users: {
                        connect: {
                            id: userId,
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
                    users:
                        chat.type === 'GROUP'
                            ? false
                            : {
                                  where: {
                                      NOT: {
                                          id: userId,
                                      },
                                  },
                                  select: {
                                      id: true,
                                      username: true,
                                      avatar_url: true,
                                  },
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

router.get('/group', async (req: Request, res: Response) => {
    const userId = req.token.id;

    try {
        const userWithGroupChats = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                chats: {
                    where: {
                        type: 'GROUP',
                    },
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

        if (!userWithGroupChats) {
            return res.status(400).json({ message: 'No chat rooms found' });
        }

        return res.status(200).json(userWithGroupChats.chats);
    } catch (error) {
        console.log(error);

        return res.sendStatus(500);
    }
});

router.get('/private', async (req: Request, res: Response) => {
    const userId = req.token.id;

    try {
        const userWithPrivateChats = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                chats: {
                    where: {
                        type: 'PRIVATE',
                    },
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
                        users: {
                            where: {
                                NOT: {
                                    id: userId,
                                },
                            },
                            select: {
                                id: true,
                                avatar_url: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });

        if (!userWithPrivateChats) {
            return res.status(400).json({ message: 'No chat rooms found' });
        }

        // Filter private chats that the current user has left.
        const activePrivateChats = userWithPrivateChats?.chats.filter((chat) => {
            return !userWithPrivateChats?.leftPrivateChatIds.includes(chat.id);
        });

        return res.status(200).json(activePrivateChats);
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

//TODO: s3 instead of cloudinary
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
            const type = req.file.mimetype;
            const fileExtension = req.file.mimetype.split('/')[1];
            const filename = `${uuid()}.${fileExtension}`;

            const input = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: `icon/${filename}`,
                Body: req.file.buffer,
                ContentType: type,
            };

            const putCommand = new PutObjectCommand(input);

            await s3.send(putCommand);

            const result = await prisma.chat.create({
                data: {
                    name: roomName,
                    ownerId,
                    icon_url: `${process.env.AWS_S3_URL}/${input.Key}`,
                    Key: input.Key,
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

//TODO: s3 instead of cloudinary
router.delete('/', async (req: Request, res: Response) => {
    const { chatId } = req.body;

    try {
        const chat = await prisma.chat.delete({
            where: {
                id: chatId,
            },
        });

        if (chat && chat.Key) {
            const input = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: chat.Key,
            };

            const deleteCommand = new DeleteObjectCommand(input);

            await s3.send(deleteCommand);
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

//TODO: s3 instead of cloudinary
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
            if (currentChat.Key) {
                const input = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: currentChat.Key,
                };

                const deleteCommand = new DeleteObjectCommand(input);

                await s3.send(deleteCommand);
            }

            if (req.file) {
                // Upload a new image.
                const type = req.file.mimetype;
                const fileExtension = req.file.mimetype.split('/')[1];
                const filename = `${uuid()}.${fileExtension}`;

                const input = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `icon/${filename}`,
                    Body: req.file.buffer,
                    ContentType: type,
                };

                const putCommand = new PutObjectCommand(input);

                await s3.send(putCommand);

                await prisma.chat.update({
                    where: {
                        id: chatId,
                    },
                    data: {
                        name: roomName,
                        icon_url: `${process.env.AWS_S3_URL}/${input.Key}`,
                        Key: input.Key,
                    },
                });
            } else {
                await prisma.chat.update({
                    where: {
                        id: chatId,
                    },
                    data: {
                        name: roomName,
                        Key: null,
                        icon_url: null,
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
        const existingChat = await prisma.chat.findFirst({
            where: {
                AND: [
                    { name: null },
                    { icon_url: null },
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
                users: {
                    where: {
                        NOT: {
                            id: senderId,
                        },
                    },
                    select: {
                        id: true,
                        avatar_url: true,
                        username: true,
                    },
                },
            },
        });

        if (existingChat) {
            return res.status(200).json(existingChat);
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
                users: {
                    where: {
                        NOT: {
                            id: senderId,
                        },
                    },
                    select: {
                        id: true,
                        avatar_url: true,
                        username: true,
                    },
                },
            },
        });

        // Don't show the private chat initially to the receiver.
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

router.post(
    '/:chatId/attachments',
    uploader.single('file'),
    async (req: Request, res: Response) => {
        const { chatId } = req.params;

        if (!req.file) {
            return res.status(500).json({ message: 'Something went wrong, please try again...' });
        }

        try {
            //Upload an image to s3
            const type = req.file.mimetype;
            const fileExtension = req.file.mimetype.split('/')[1];
            const Key = `${uuid()}.${fileExtension}`;

            const input = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: `chat/${chatId}/${Key}`,
                Body: req.file.buffer,
                ContentType: type,
            };

            const putCommand = new PutObjectCommand(input);

            await s3.send(putCommand);

            const attachment = {
                Key: input.Key,
                url: `${process.env.AWS_S3_URL}/${input.Key}`,
            };

            return res.status(200).json(attachment);
        } catch (error) {
            console.log(error);

            return res.status(500).json({ message: 'Something went wrong, please try again...' });
        }
    }
);

router.delete('/:chatId/attachments', async (req: Request, res: Response) => {
    const { Key } = req.body;

    try {
        if (Key) {
            const input = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: Key,
            };

            const deleteCommand = new DeleteObjectCommand(input);

            const result = await s3.send(deleteCommand);

            return res.status(204).json(result);
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again...' });
    }
});

export default router;
