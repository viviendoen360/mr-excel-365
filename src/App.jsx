import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { ShieldCheck } from 'lucide-react';

// Importamos todas tus páginas correctamente
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Videos from './pages/Videos';
import Admin from './pages/Admin';
import Contacto from './pages/Contacto';
import Privacidad from './pages/Privacidad';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({});

  useEffect(() => {
    // 1. Detectar si el administrador inició sesión
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // 2. Traer los logos y datos de contacto desde Firebase
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
        {currentView === 'privacidad' && <Privacidad />}
      </main>

      {/* Footer Legal LOPDP */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <p className="text-gray-500 text-sm mb-3">
            © {new Date().getFullYear()} Mr.Excel365. Todos los derechos reservados.
          </p>
          <button 
            onClick={() => setCurrentView('privacidad')} 
            className="text-xs font-semibold text-blue-600 hover:text-emerald-600 hover:underline transition-colors flex items-center"
          >
            <ShieldCheck className="w-3 h-3 mr-1" />
            Política de Privacidad y Protección de Datos (LOPDP)
          </button>
        </div>
      </footer>
    </div>
  );
}