import React, { useState } from 'react';
import { Home, Video, Settings, Menu, X } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 text-white font-bold text-xl mr-2 shadow-sm">
              X
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
            <button onClick={() => setCurrentView('admin')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'admin' ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              <Settings className="w-4 h-4 mr-1" /> Admin
            </button>
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-gray-900 focus:outline-none">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">Inicio</button>
            <button onClick={() => { setCurrentView('videos'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">Videos</button>
            <button onClick={() => { setCurrentView('admin'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Administrador</button>
          </div>
        </div>
      )}
    </nav>
  );
}
