/// <reference types="cypress" />

Cypress.Commands.add('dataCy', (value) => {
	return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add('login', () => {
	cy.fixture('users.json').then((users) => {
		cy.request({
			method: 'POST',
			url: 'http://localhost:8080/auth/login',
			body: {
				email: users[0].email,
				password: users[0].username,
			},
		});
	});
	//Set jwt from the server.
});

Cypress.Commands.add('seed', () => {
	cy.request('http://localhost:8080/seed').then((response) => {
		cy.writeFile('cypress/fixtures/users.json', response.body.testUsers);
		cy.writeFile('cypress/fixtures/chats.json', response.body.testChats);
		cy.writeFile('cypress/fixtures/messages.json', response.body.testMessages);
	});
});
