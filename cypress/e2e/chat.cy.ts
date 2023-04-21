describe('chat', () => {
	before(() => {
		cy.seed();
	});

	beforeEach(() => {
		cy.login();
		cy.fixture('chats.json').then((chats) => {
			cy.visit(`/chat/${chats[0].id}`);
		});
	});

	it('does not allow users to send a message with empty string', () => {
		cy.dataCy('message-submit').should('be.disabled');
	});

	it('allows users to send a message', () => {
		cy.dataCy('message-input').type('hello world');
		cy.dataCy('message-submit').should('be.enabled');
		cy.dataCy('message-submit').click();

		cy.dataCy('chat-body').contains('hello world');
	});

	it.only('allows users to leave a chat', () => {
		cy.get('.h-full > .absolute > .swap-rotate > .swap-on > path').click();
		cy.get('.h-full > .right-5 > .swap-rotate > input').check({ force: true });
		cy.get('[data-cy="dropdown-menu"] > :nth-child(2) > .flex').click();

		cy.dataCy('chat-room-list').find('tr').should('have.length', 0);
	});
});
