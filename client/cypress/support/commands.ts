/// <reference types="cypress" />

Cypress.Commands.add('dataCy', (value) => {
	return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add('login', (email, password) => {
	cy.session([email, password], () => {
		cy.visit('/login');
		cy.dataCy('email-input').type(email);
		cy.dataCy('password-input').type(password);
		cy.dataCy('submit-button').click();
		cy.url().should('contain', '/explorer');
	});
});

Cypress.Commands.add('seed', () => {
	cy.request('http://localhost:8080/seed').then((response) => {
		cy.writeFile('cypress/fixtures/users.json', response.body.testUsers);
		cy.writeFile('cypress/fixtures/chats.json', response.body.testChats);
		cy.writeFile('cypress/fixtures/messages.json', response.body.testMessages);
	});
});
