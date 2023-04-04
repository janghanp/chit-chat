import { Navigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

import useUser from '../hooks/useUser';

const RequireAuth = () => {
	const location = useLocation();
	const { data: currentUser } = useUser();

	if (!currentUser) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <Outlet />;
};

export default RequireAuth;
