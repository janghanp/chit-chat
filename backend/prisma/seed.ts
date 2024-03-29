import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

const prisma = new PrismaClient();

export async function main() {
    console.log('🌱 Seeding...');
    console.time(`🌱 Database has been seeded`);

    console.time('🧹 Cleaned up the database...');
    await prisma.message.deleteMany({ where: {} });
    await prisma.chat.deleteMany({ where: {} });
    await prisma.notification.deleteMany({ where: {} });
    await prisma.user.deleteMany({ where: {} });
    console.timeEnd('🧹 Cleaned up the database...');

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

    const messageTemplates: { chatId: string; text: string; senderId: string; id?: string }[] = [];

    for (let i = 0; i < 50; i++) {
        const message = {
            chatId: chat.id,
            text: faker.lorem.text(),
            senderId: user1.id as string,
        };

        messageTemplates.push(message);
    }

    await prisma.message.createMany({ data: messageTemplates });

    const message = await prisma.message.findFirst({
        where: {
            text: messageTemplates[0].text,
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

    // fs.outputFile(
    //     path.resolve('../cypress/fixtures', `users.json`),
    //     JSON.stringify([user1, user2])
    // );

    // fs.outputFile(path.resolve('../cypress/fixtures', `chats.json`), JSON.stringify([chat]));

    console.timeEnd(`🌱 Database has been seeded`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
