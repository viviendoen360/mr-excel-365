import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Videos from './pages/Videos';
import Admin from './pages/Admin';
import Contacto from './pages/Contacto'; // <-- Nuevo import

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main>
        {currentView === 'home' && <Home setCurrentView={setCurrentView} />}
        {currentView === 'videos' && <Videos />}
        {currentView === 'admin' && <Admin user={user} />}
        {currentView === 'contacto' && <Contacto />} {/* <-- Nueva vista */}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Mr.Excel365. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}