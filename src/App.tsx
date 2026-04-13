import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { Navbar } from './components/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { Home } from './pages/Home';
import { HallOfFame } from './pages/HallOfFame';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hall-of-fame" element={<HallOfFame />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <footer className="border-t py-8 bg-muted/30">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>© 2026 PhotoComp. Todos os direitos reservados.</p>
              <p className="mt-2 italic">Capture o momento, inspire o mundo.</p>
            </div>
          </footer>
        </div>
        <Toaster position="top-center" />
      </Router>
    </AuthProvider>
  );
}
