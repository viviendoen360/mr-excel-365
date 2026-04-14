import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './services/firebase';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Videos from './pages/Videos';
import Admin from './pages/Admin';
import Contacto from './pages/Contacto';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({}); // Aquí guardamos logo y banner

  useEffect(() => {
    // 1. Detectar usuario
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // 2. Detectar configuración de marca (Logo y Banner)
    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'perfil'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeConfig();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Pasamos la configuración al Navbar para el logo circular */}
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        logoUrl={config.logoUrl} 
      />
      
      <main>
        {currentView === 'home' && <Home setCurrentView={setCurrentView} />}
        {currentView === 'videos' && <Videos />}
        {currentView === 'admin' && <Admin user={user} />}
        {currentView === 'contacto' && <Contacto config={config} />}
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