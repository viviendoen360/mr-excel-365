import React, { useState } from 'react';
import { Home, Video, Settings, Menu, X, User } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, logoUrl }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
            {/* LOGO CIRCULAR DINÁMICO */}
            <div className="w-10 h-10 rounded-lg overflow-hidden mr-2 shadow-sm flex items-center justify-center bg-gradient-to-br from-emerald-500 to-blue-600">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xl">X</span>
              )}
            </div>
            <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 tracking-tight">
              Mr.Excel365
            </span>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <button onClick={() => setCurrentView('home')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'home' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'}`}>
              <Home className="w-4 h-4 mr-1" /> Inicio
            </button>
            <button onClick={() => setCurrentView('videos')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'videos' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}>
              <Video className="w-4 h-4 mr-1" /> Videos
            </button>
            <button onClick={() => setCurrentView('contacto')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'contacto' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'}`}>
              <User className="w-4 h-4 mr-1" /> Contacto
            </button>
            <button onClick={() => setCurrentView('admin')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'admin' ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              <Settings className="w-4 h-4 mr-1" /> Admin
            </button>
          </div>
          
          {/* ... resto del código del menú móvil igual ... */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-gray-900 focus:outline-none">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* ... (código del menú móvil) ... */}
    </nav>
  );
}