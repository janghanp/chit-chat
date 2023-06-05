import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'ws://api.chitchat.lat';

export const socket = io(URL as string, { autoConnect: true });
