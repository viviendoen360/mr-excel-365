import React from 'react';
import { Mail, MessageCircle, Youtube, Facebook, Smartphone } from 'lucide-react';

export default function Contacto({ config }) {
  if (!config) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* HEADER CON BANNER O GRADIENTE */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-emerald-500 to-blue-600">
          {config.bannerUrl && (
            <img src={config.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          )}
          
          {/* Foto de perfil flotante sobre el banner */}
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-1 shadow-xl border-4 border-white overflow-hidden flex items-center justify-center">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-3xl font-bold text-emerald-600">XR</span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{config.nombre}</h2>
          <p className="text-emerald-600 font-medium text-lg mb-6">{config.titulo}</p>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Canales Directos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Botones de redes sociales igual que antes... */}
              <a href={`mailto:${config.correo}`} className="flex items-center p-4 rounded-xl border border-gray-100 hover:bg-blue-50 transition-colors group">
                <Mail className="w-6 h-6 text-blue-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="font-semibold text-gray-900">{config.correo}</p>
                </div>
              </a>
              {/* Añade aquí el resto de botones de redes como en el código anterior */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}