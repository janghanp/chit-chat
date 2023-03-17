import { Routes, Route } from 'react-router-dom';

import { UserProvider } from '../context/UserContext';
import RequireAuth from '../components/RequiredAuth';
import Layout from './Layout';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import AutoLogin from '../components/AutoLogin';
import Chat from './Chat';
import NoMatch from './NoMatch';

//? What happens if I put socket connection in App.tsx inside of useEffect?

function App() {
	console.log('App.tsx render');

	return (
		<UserProvider>
			<Routes>
				<Route element={<AutoLogin />}>
					<Route path="/" element={<Layout />}>
						<Route
							path="/explorer"
							element={
								<RequireAuth>
									<Home />
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
