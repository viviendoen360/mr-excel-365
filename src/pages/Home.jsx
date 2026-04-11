import React from 'react';
import { Play, Mail } from 'lucide-react';

export default function Home({ setCurrentView }) {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            Domina Excel y multiplica tu productividad con <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Mr.Excel365</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Aprende desde fórmulas básicas hasta macros avanzadas con videos cortos y directos al grano.
          </p>
          <button onClick={() => setCurrentView('videos')} className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 shadow-lg transform transition hover:-translate-y-1">
            <Play className="w-5 h-5 mr-2" />
            Ver Tutoriales Ahora
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex flex-col justify-center">
              <Mail className="w-12 h-12 mb-4 opacity-80" />
              <h2 className="text-3xl font-bold mb-2">Únete a la comunidad</h2>
              <p className="text-emerald-100">Recibe notificaciones de nuevos videos y plantillas exclusivas.</p>
            </div>
            <div className="p-10 flex items-center justify-center">
              <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); alert("¡Gracias por suscribirte!"); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" required placeholder="Tu nombre" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input type="email" required placeholder="tu@correo.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                </div>
                <button type="submit" className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition">
                  Suscribirme
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
