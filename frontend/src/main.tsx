import ReactDOM from 'react-dom/client';
import App from './pages/App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

import './index.css';

// axios.defaults.baseURL = 'https://chitchat.lat/api';
axios.defaults.baseURL = 'http://localhost:9000/api';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,
        },
    },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <Toaster />
            <App />
        </QueryClientProvider>
    </BrowserRouter>
);
