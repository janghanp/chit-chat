import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";
import RequireAuth from "../components/RequiredAuth";
import Layout from "./Layout";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import AutoLogin from "../components/AutoLogin";
import Settings from "./Settings";
import Chat from "./Chat";
import NoMatch from "./NoMatch";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AutoLogin />}>
          {/* with Layout */}
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
              path="/chat/:roomId"
              element={
                <RequireAuth>
                  <Chat />
                </RequireAuth>
              }
            />
          </Route>
          {/* with Layout */}

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
