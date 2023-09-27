import ReactDOM from 'react-dom/client';
import App from './pages/App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

import './index.css';

axios.defaults.baseURL = 'https://server.chitchat.lat/api';

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
