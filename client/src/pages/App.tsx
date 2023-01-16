import { Routes, Route } from 'react-router-dom';

import { UserProvider } from '../context/UserContext';
import RequireAuth from '../components/RequiredAuth';
import Layout from './Layout';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import AutoLogin from '../components/AutoLogin';
import Settings from './Settings';
import Chat from './Chat';
import NoMatch from './NoMatch';

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route element={<AutoLogin />}>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route
              path="/chat/:roomName"
              element={
                <RequireAuth>
                  <Chat />
                </RequireAuth>
              }
            />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;
