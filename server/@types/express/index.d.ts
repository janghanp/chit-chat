import { TokenType } from '../../src/utils/token';

declare global {
	namespace Express {
		interface Request {
			token: TokenType;
		}
	}
}
