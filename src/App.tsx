import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FirstTimeSetup } from './pages/FirstTime';
import { SetupGuard } from './components/SetupGuard';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AnimePage } from './pages/AnimePage';
import { AnimeLibrary } from './pages/Library';
import { TitleBar } from './components/TitleBar';
import { PageTransition } from './components/PageTransition';

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
                <div className="relative w-full h-full">
                  <Routes>
                    <Route path="/setup" element={<PageTransition><FirstTimeSetup /></PageTransition>} />
                    <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
                    <Route path="/anime/:id" element={<PageTransition><AnimePage /></PageTransition>} />
                    <Route path="/search" element={<PageTransition><HomePage /></PageTransition>} />
                    <Route path="/schedule" element={<PageTransition><HomePage /></PageTransition>} />
                    <Route path="/library" element={<PageTransition><AnimeLibrary /></PageTransition>} />
                    <Route path='/downloads' element={<PageTransition><HomePage /></PageTransition>} />
                  </Routes>
                </div>
              </Layout>
            </SetupGuard>
          </div>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;