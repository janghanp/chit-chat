import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? 'https://server.chitchat.lat' : 'ws://localhost:5000';

export const socket = io(URL as string, { autoConnect: true });
