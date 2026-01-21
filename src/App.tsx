import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import SensorLevel from './pages/SensorLevel';
import FactoryLevel from './pages/FactoryLevel';
import ApplicationLevel from './pages/ApplicationLevel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FactoryLevel />} />
          <Route path="/sensor/:deviceId" element={<SensorLevel />} />
          <Route path="/application/:category" element={<ApplicationLevel />} />
        </Routes>
      </BrowserRouter>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;