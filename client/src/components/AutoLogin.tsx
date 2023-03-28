import { Outlet } from 'react-router-dom';

import useUser from '../hooks/useUser';

const AutoLogin = () => {
	const { isLoading, isError, data } = useUser();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error...</div>;
	}

	return <>{isLoading ? <div>loading...</div> : <Outlet />}</>;
};

export default AutoLogin;
