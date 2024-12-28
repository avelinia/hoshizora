import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FirstTimeSetup } from './pages/FirstTime';
import { SetupGuard } from './components/SetupGuard';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AnimePage } from './pages/AnimePage';
import { TitleBar } from './components/TitleBar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 24 * 60 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="h-screen flex flex-col">
            <TitleBar />
            <SetupGuard>
              <Layout>
                <Routes>
                  <Route path="/setup" element={<FirstTimeSetup />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/anime/:id" element={<AnimePage />} />
                  <Route path="/search" element={<HomePage />} />
                  <Route path="/schedule" element={<HomePage />} />
                  <Route path="/library" element={<HomePage />} />
                </Routes>
              </Layout>
            </SetupGuard>
          </div>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;