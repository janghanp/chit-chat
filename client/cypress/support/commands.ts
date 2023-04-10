/// <reference types="cypress" />

export {};

Cypress.Commands.add('dataCy', (value) => {
	return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add('login', (email, password) => {
	cy.session([email, password], () => {
		cy.visit('/login');
		cy.dataCy('email-input').type(email);
		cy.dataCy('password-input').type(password);

		cy.dataCy('submit-button').click();

		cy.location().should((loc) => {
			expect(loc.pathname).to.eq('/explorer');
		});
	});
});
