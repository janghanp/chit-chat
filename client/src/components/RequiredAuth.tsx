import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { socket } from '../socket';

import { useCurrentUserStore } from '../store';

const RequireAuth = () => {
	const location = useLocation();

	const currentUser = useCurrentUserStore((state) => state.currentUser);

	const [isConnected, setIsConnected] = useState<boolean>(false);

	useEffect(() => {
		if (currentUser) {
			socket.connect();
		}
	}, [currentUser]);

	// Managing a socket connection.
	useEffect(() => {
		function onConnect() {
			setIsConnected(true);
		}

		function onDisConnect() {
			setIsConnected(false);
		}

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisConnect);

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisConnect);
		};
	}, []);

	useEffect(() => {
		if (isConnected && currentUser) {
			socket.emit('user_connect', { userId: currentUser.id, chatIds: currentUser?.chats.map((chat) => chat.id) });
		}
	}, [isConnected, currentUser]);

	if (!currentUser) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <Outlet />;
};

export default RequireAuth;
