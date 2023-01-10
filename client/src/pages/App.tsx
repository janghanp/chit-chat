import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";
import RequireAuth from "../components/RequiredAuth";
import Layout from "./Layout";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import AutoLogin from "../components/AutoLogin";
import Settings from "./Settings";

function App() {
  return (
    <AuthProvider>
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
          </Route>
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
