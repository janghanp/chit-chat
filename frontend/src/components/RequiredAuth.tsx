import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { HashLoader } from 'react-spinners';

import useUser from '../hooks/useUser';
import useGroupChatRooms from '../hooks/useGroupChatRooms';
import { socket } from '../socket';

const RequireAuth = () => {
	const location = useLocation();
	const { data: currentUser } = useUser();
	const { data: groupChatRooms } = useGroupChatRooms();
	const [isSet, setIsSet] = useState<boolean>(false);

	useEffect(() => {
		if (socket.connected && groupChatRooms && currentUser && !isSet) {
			socket.emit('user_connect', { userId: currentUser.id, chatIds: groupChatRooms.map((chat) => chat.id) });
			setIsSet(true);
		}
	}, [groupChatRooms, currentUser, isSet]);

	if (!currentUser) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (!isSet) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<HashLoader color='#394E6A' />
			</div>
		);
	}

	return <Outlet />;
};

export default RequireAuth;
