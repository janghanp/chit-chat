describe('Login', () => {
	before(() => {
		cy.seed();
	});

	beforeEach(() => {
		cy.visit('/login');
	});

	it('does not allow users to login with unregistered account', () => {
		cy.dataCy('email-input').type('test30@test.com');
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
		cy.fixture('users.json').then((users) => {
			cy.dataCy('email-input').type(users[0].email);
			cy.dataCy('password-input').type(users[0].username);

			cy.dataCy('submit-button').click();

			cy.location('pathname').should('eq', '/explorer');
		});
	});
});
