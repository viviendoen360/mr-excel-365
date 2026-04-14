import React from 'react';
import { Mail, MessageCircle, Youtube, Facebook, Smartphone } from 'lucide-react';

export default function Contacto({ config }) {
  if (!config || Object.keys(config).length === 0) {
    return <div className="text-center py-20 text-gray-500">Configura tu perfil en el panel de Administrador.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Banner superior */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-emerald-500 to-blue-600">
          {config.bannerUrl && <img src={config.bannerUrl} alt="Banner" className="w-full h-full object-cover" />}
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-1 shadow-xl border-4 border-white overflow-hidden flex items-center justify-center">
              {config.logoUrl ? <img src={config.logoUrl} alt="Profile" className="w-full h-full object-cover rounded-full" /> : <span className="text-3xl font-bold text-emerald-600">XR</span>}
            </div>
          </div>
        </div>

        {/* Información de Perfil */}
        <div className="pt-16 pb-8 px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{config.nombre}</h2>
          <p className="text-emerald-600 font-medium text-lg mb-6">{config.titulo}</p>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Canales Directos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.correo && (
                <a href={`mailto:${config.correo}`} className="flex items-center p-4 rounded-xl border border-gray-100 hover:bg-blue-50 transition-colors group">
                  <Mail className="w-6 h-6 text-blue-600 mr-4" />
                  <div><p className="text-sm text-gray-500 font-medium">Email</p><p className="font-semibold text-gray-900">{config.correo}</p></div>
                </a>
              )}
              {config.whatsapp && (
                <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-xl border border-gray-100 hover:bg-green-50 transition-colors group">
                  <MessageCircle className="w-6 h-6 text-green-600 mr-4" /><span className="font-semibold text-gray-900">WhatsApp</span>
                </a>
              )}
              {config.youtube && (
                <a href={config.youtube} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-xl border border-gray-100 hover:bg-red-50 transition-colors group">
                  <Youtube className="w-6 h-6 text-red-600 mr-4" /><span className="font-semibold text-gray-900">YouTube</span>
                </a>
              )}
              {config.tiktok && (
                <a href={config.tiktok} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors group">
                  <Smartphone className="w-6 h-6 text-gray-800 mr-4" /><span className="font-semibold text-gray-900">TikTok</span>
                </a>
              )}
              {config.facebook && (
                <a href={config.facebook} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-xl border border-gray-100 hover:bg-blue-50 transition-colors group">
                  <Facebook className="w-6 h-6 text-blue-700 mr-4" /><span className="font-semibold text-gray-900">Facebook</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}