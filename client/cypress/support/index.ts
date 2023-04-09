export {};

declare global {
	namespace Cypress {
		interface Chainable {
			dataCy(value: string): Chainable<JQuery<HTMLElement>>;
			login(email: string, password: string): void;
		}
	}
}
