/// <reference types="cypress" />

Cypress.Commands.add('dataCy', (value) => {
	return cy.get(`[data-cy=${value}]`);
});

//TODO: Check this command in local environment.
Cypress.Commands.add('login', () => {
	cy.fixture('users.json').then((users) => {
		cy.request({
			method: 'POST',
			url: `${Cypress.env('apiUrl')}/auth/login`,
			body: {
				email: users[0].email,
				password: users[0].username,
			},
		});
	});
	//Set jwt from the server.
});

Cypress.Commands.add('seed', () => {
	cy.exec('yarn test:e2e:seed');
});
