import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useUser } from '../context/UserContext';
import useAuth, { isAuthSuccessResponse, isAuthErrorResponse } from '../hooks/useAuth';

const AutoLogin = () => {
	const { setCurrentUser } = useUser();

	const { refresh } = useAuth();

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
			}

			if (isAuthErrorResponse(result)) {
				console.log(result);
			}

			setIsAuthenticating(false);
		};

		autoLogin();
	}, [setCurrentUser, refresh]);

	return <>{isAuthenticating ? <div>loading...</div> : <Outlet />}</>;
};

export default AutoLogin;
