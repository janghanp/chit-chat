describe('Login', () => {
	beforeEach(() => {
		cy.visit('http://localhost:5173');
	});

	it('does not allow users to login with unregistered account', () => {
		cy.dataCy('email-input').type('test20@test.com');
		cy.dataCy('password-input').type('123123');

		cy.dataCy('submit-button').click();

		cy.dataCy('email-error').contains('Incorrect email address or password');
		cy.dataCy('password-error').contains('Incorrect email address or password');
	});

	it('does not allow users to login with empty email and password', () => {
		cy.dataCy('submit-button').click();

		cy.dataCy('email-error').contains('Email is required');
		cy.dataCy('password-error').contains('Password is required');
	});

	it('does not allow users to login with incorrect email', () => {
		cy.dataCy('email-input').type('test20!test.com');
		cy.dataCy('password-input').type('123123');

		cy.dataCy('submit-button').click();

		cy.dataCy('email-error').contains('Invalid email');
	});

	it('allows users to login', () => {
		cy.dataCy('email-input').type('test1@test.com');
		cy.dataCy('password-input').type('123123');

		cy.dataCy('submit-button').click();

		cy.location().should((loc) => {
			expect(loc.pathname).to.eq('/explorer');
		});
	});
});
