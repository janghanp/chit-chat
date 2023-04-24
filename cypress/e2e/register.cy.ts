import { faker } from '@faker-js/faker';

describe('register', () => {
	beforeEach(() => {
		cy.visit('/register');
	});

	it('does not allow users to register with an empty email', () => {
		cy.dataCy('password-input').type('123123');
		cy.dataCy('confirmPassword-input').type('123123');
		cy.dataCy('username-input').type('test_user');

		cy.dataCy('submit-button').click();

		cy.dataCy('email-error').contains('Email is required');
	});

	it('does not allow users to register with an empty password', () => {
		cy.dataCy('email-input').type('test@test.com');
		cy.dataCy('confirmPassword-input').type('123123');
		cy.dataCy('username-input').type('test_user');

		cy.dataCy('submit-button').click();

		cy.dataCy('password-error').contains('Password is required');
	});

	it('does not allow users to register with an empty confirmPassword', () => {
		cy.dataCy('email-input').type('test@test.com');
		cy.dataCy('password-input').type('123123');
		cy.dataCy('username-input').type('test_user');

		cy.dataCy('submit-button').click();

		cy.dataCy('confirmPassword-error').contains('Password is required');
	});

	it('does not allow users to register with unmatch passwords', () => {
		cy.dataCy('email-input').type('test@test.com');
		cy.dataCy('password-input').type('123123');
		cy.dataCy('confirmPassword-input').type('123');
		cy.dataCy('username-input').type('test_user');

		cy.dataCy('submit-button').click();

		cy.dataCy('password-error').contains('Passwords should match');
	});

	it('does not allow users to register with an empty username', () => {
		cy.dataCy('email-input').type('test@test.com');
		cy.dataCy('password-input').type('123123');
		cy.dataCy('confirmPassword-input').type('123123');

		cy.dataCy('submit-button').click();

		cy.dataCy('username-error').contains('Username is required');
	});

	it('does not allow users to register with a taken email', () => {
		cy.fixture('users.json').then((users) => {
			cy.dataCy('email-input').type(users[0].email);
		});
		cy.dataCy('password-input').type('123123');
		cy.dataCy('confirmPassword-input').type('123123');
		cy.dataCy('username-input').type('test20');

		cy.dataCy('submit-button').click();

		cy.dataCy('email-error').contains('This email is already in use.');
	});

	it('does not allow users to register with a taken username', () => {
		cy.dataCy('email-input').type('test20@test.com');
		cy.dataCy('password-input').type('123123');
		cy.dataCy('confirmPassword-input').type('123123');

		cy.fixture('users.json').then((users) => {
			cy.dataCy('username-input').type(users[0].username);
		});

		cy.dataCy('submit-button').click();

		cy.dataCy('username-error').contains('This username is already in use.');
	});

	it('allow users to register', () => {
		cy.intercept('POST', '/api/auth/register').as('register');
		cy.intercept('GET', '/api/chat/rooms*').as('chatRooms');
		cy.intercept('GET', '/api/user/friends*').as('friends');

		const username = faker.name.firstName();

		cy.dataCy('email-input').type(faker.internet.email());
		cy.dataCy('password-input').type(username);
		cy.dataCy('confirmPassword-input').type(username);
		cy.dataCy('username-input').type(username);

		cy.dataCy('submit-button').click();

		cy.location('pathname').should('eq', '/explorer');

		cy.wait('@register').its('response.statusCode').should('eq', 200);

		cy.wait('@chatRooms');
		cy.dataCy('chatRoom').should('not.exist');

		cy.dataCy('friend-button').click();

		cy.wait('@friends');
		cy.dataCy('friend').should('not.exist');
	});
});
