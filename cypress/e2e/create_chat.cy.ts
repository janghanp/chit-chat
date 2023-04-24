import { faker } from '@faker-js/faker';

describe('onBoarding', () => {
	beforeEach(() => {
		cy.login();
		cy.visit('/explorer');
	});

	it('should show chatRooms that a user in', () => {
		cy.dataCy('chat-room-list').find('tr').should('have.length', 1);
	});

	it('does not allow to create a chat', () => {
		cy.dataCy('create-chat-button').click();
		cy.dataCy('create-chat-modal').should('exist');
		cy.dataCy('create-chat-submit').click();
		cy.dataCy('create-chat-error').contains('Please provide a chatroom name');

		cy.fixture('chats.json').then((chats) => {
			cy.dataCy('create-chat-input').type(chats[0].name);

			cy.dataCy('create-chat-submit').click();
			cy.dataCy('create-chat-error').contains('The chatroom name already exists.');
		});
	});

	it('allows to creat a chat', () => {
		cy.intercept('POST', '/api/chat').as('createChat');

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
