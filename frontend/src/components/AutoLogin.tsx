import { Outlet } from 'react-router-dom';

import useUser from '../hooks/useUser';

const AutoLogin = () => {
	const { isLoading, isError } = useUser();

	if (isLoading) {
		return <div></div>;
	}

	if (isError) {
		return <div>Error...</div>;
	}

	return (
		<>
			<Outlet />
		</>
	);
};

export default AutoLogin;
