import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useChatsStore, useCurrentUserStore } from '../store';
import useAuth, { isAuthSuccessResponse, isAuthErrorResponse } from '../hooks/useAuth';

const AutoLogin = () => {
	const { refresh } = useAuth();

	const setCurrentUser = useCurrentUserStore((state) => state.setCurrentUser);
	const setChats = useChatsStore((state) => state.setChats);

	const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

	useEffect(() => {
		const autoLogin = async () => {
			const result = await refresh();

			if (isAuthSuccessResponse(result)) {
				const { id, username, email, avatar, public_id, chats } = result;

				setCurrentUser({
					id,
					username,
					email,
					avatar,
					public_id,
					chats,
				});

				setChats(chats);
			}

			if (isAuthErrorResponse(result)) {
				console.log(result);
			}

			setIsAuthenticating(false);
		};

		autoLogin();
	}, []);

	return <>{isAuthenticating ? <div>loading...</div> : <Outlet />}</>;
};

export default AutoLogin;
