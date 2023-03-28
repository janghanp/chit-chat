import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Seeding...');
	console.time(`🌱 Database has been seeded`);

	console.time('🧹 Cleaned up the database...');
	await prisma.message.deleteMany({ where: {} });
	await prisma.chat.deleteMany({ where: {} });
	await prisma.user.deleteMany({ where: {} });
	console.timeEnd('🧹 Cleaned up the database...');

	const users: User[] = [];

	for (let i = 1; i < 10; i++) {
		const user = await prisma.user.create({
			data: {
				email: `test${i}@test.com`,
				password: bcrypt.hashSync('123123', salt),
				username: `test${i}`,
			},
		});

		users.push(user);
	}

	const chat = await prisma.chat.create({
		data: {
			name: 'chat1',
			ownerId: users[0].id,
			users: {
				connect: {
					id: users[0].id,
				},
			},
		},
	});

	for (let i = 1; i < 50; i++) {
		const message = await prisma.message.create({
			data: {
				chatId: chat.id,
				text: `${i}`,
				senderId: users[0].id,
			},
		});

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
	}

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
