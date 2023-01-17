import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import axios from 'axios';

import { useUser } from '../context/UserContext';
import { AxiosResponseWithUser } from '../types';

const AutoLogin = () => {
	const { setCurrentUser } = useUser();

	const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

	useEffect(() => {
		//send a http request if the current jwt token in cookie is still valid
		const refresh = async () => {
			try {
				const { data } = await axios.get<AxiosResponseWithUser>('http://localhost:8080/auth/refresh', {
					withCredentials: true,
				});

				if (data.email) {
					setCurrentUser({
						id: data.id,
						username: data.username,
						email: data.email,
						avatar: data.avatar,
						public_id: data.public_id,
						chats: data.chats,
					});
				}
			} catch (error) {
				console.log(error);
			} finally {
				setIsAuthenticating(false);
			}
		};

		refresh();
	}, [setCurrentUser]);

	return <>{isAuthenticating ? <div>loading...</div> : <Outlet />}</>;
};

export default AutoLogin;
