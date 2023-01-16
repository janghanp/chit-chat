import { useNavigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import { useUser } from '../context/UserContext';

const AuthStatus = () => {
  const auth = useAuth();

  const { currentUser } = useUser();

  const navigate = useNavigate();

  if (!currentUser.email) {
    return <p>You are not logged in.</p>;
  }

  return (
    <p>
      Welcome {currentUser.username}!{' '}
      <button
        onClick={() => {
          auth.logout();
          navigate('/');
        }}
      >
        Sign out
      </button>
    </p>
  );
};

export default AuthStatus;
