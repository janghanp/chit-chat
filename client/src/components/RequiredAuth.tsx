import { Navigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

import { useCurrentUserStore } from '../store';

const RequireAuth = () => {
	const location = useLocation();

	const currentUser = useCurrentUserStore((state) => state.currentUser);

	if (!currentUser) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <Outlet />;
};

export default RequireAuth;
