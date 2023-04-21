export {};

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Cypress {
		interface Chainable {
			dataCy(value: string): Chainable<JQuery<HTMLElement>>;
			login(): void;
			seed(): void;
		}
	}
}
