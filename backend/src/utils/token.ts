import jwt from 'jsonwebtoken';

export interface TokenType {
    email: string;
    username: string;
    id: string;
    iat: number;
    exp: number;
}

export const generateToken = (username: string, email: string, id: string): string => {
    return jwt.sign({ username, email, id }, process.env.JWT_SECRET as string, {
        expiresIn: '1d',
    });
};

export const verifyToken = (token: string): TokenType => {
    let decodedToken = {} as TokenType;

    jwt.verify(token, process.env.JWT_SECRET as string, (error, decoded) => {
        if (error) {
            throw new Error('Invaild token');
        } else {
            decodedToken = decoded as TokenType;
        }
    });

    return decodedToken;
};
