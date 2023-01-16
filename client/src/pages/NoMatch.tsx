import { Navigate } from 'react-router-dom';

const NoMatch = () => {
  return <Navigate to="/login"></Navigate>;
};

export default NoMatch;
