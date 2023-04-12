import { faker } from '@faker-js/faker';

describe('chat', () => {
	before(() => {
		cy.seed();
	});

	beforeEach(() => {
		cy.fixture('users.json').then((users) => {
			cy.login(users[0].email, users[0].username);
		});
	});

	it('should show chatRooms that a user in', () => {
		cy.intercept('GET', '/auth/refresh').as('refresh');
		cy.intercept('GET', '/chat/rooms*').as('chatRooms');

		cy.visit('/explorer');
		cy.location('pathname').should('eq', '/explorer');

		cy.wait('@refresh');
		cy.wait('@chatRooms');

		cy.dataCy('chat-room-list').find('tr').should('have.length', 1);
	});

	it('does not allow to create a chat', () => {
		cy.intercept('GET', '/auth/refresh').as('refresh');
		cy.intercept('GET', '/chat/rooms*').as('chatRooms');
		cy.intercept('POST', '/chat').as('createChat');

		cy.visit('/explorer');
		cy.location('pathname').should('eq', '/explorer');

		cy.dataCy('create-chat-button').click();
		cy.dataCy('create-chat-modal').should('exist');
		cy.dataCy('create-chat-submit').click();
		cy.dataCy('create-chat-error').contains('Please provide a chatroom name');

		cy.fixture('chats.json').then((chats) => {
			cy.dataCy('create-chat-input').type(chats[0].name);

			cy.dataCy('create-chat-submit').click();
			cy.wait('@createChat');
			cy.dataCy('create-chat-error').contains('The chatroom name already exists.');
		});
	});

	it('allows to creat a chat', () => {
		cy.intercept('GET', '/auth/refresh').as('refresh');
		cy.intercept('GET', '/chat/rooms*').as('chatRooms');
		cy.intercept('POST', '/chat').as('createChat');

		cy.visit('/explorer');
		cy.location('pathname').should('eq', '/explorer');

		cy.wait('@chatRooms');

		const chatName = faker.lorem.word();

		cy.dataCy('create-chat-button').click();
		cy.dataCy('create-chat-modal').should('exist');
		cy.dataCy('create-chat-input').type(chatName);
		cy.dataCy('create-chat-submit').click();

		cy.wait('@createChat').then(({ response }) => {
			cy.location('pathname').should('eq', `/chat/${response!.body.id}`);

			cy.dataCy('chat-room-list').find('tr').should('have.length', 2);
		});
	});
});
