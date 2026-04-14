import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Youtube, Facebook, Smartphone, Loader2 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Contacto() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchamos los cambios en el documento "perfil" dentro de la colección "config"
    const unsub = onSnapshot(doc(db, 'config', 'perfil'), (docSnap) => {
      if (docSnap.exists()) {
        setInfo(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Si no hay datos en Firebase todavía, mostramos un mensaje amigable
  if (!info) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Configura tu perfil en el panel de Administrador.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 px-8 py-12 text-center text-white">
          <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-emerald-600 mb-4 shadow-lg uppercase">
            {info.nombre?.substring(0, 2) || 'XR'}
          </div>
          <h2 className="text-3xl font-bold mb-2">{info.nombre}</h2>
          <p className="text-emerald-100 text-lg">{info.titulo || 'Creador de Mr.Excel365'}</p>
        </div>
        
        <div className="p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Información de Contacto</h3>
          
          <div className="space-y-6">
            <a href={`mailto:${info.correo}`} className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
              <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                <p className="text-lg font-semibold text-gray-900">{info.correo}</p>
              </div>
            </a>

            <h3 className="text-xl font-bold text-gray-800 mt-8 mb-6 border-b pb-2">Mis Redes Sociales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {info.whatsapp && (
                <a href={`https://wa.me/${info.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-colors group">
                  <div className="bg-green-100 p-3 rounded-lg text-green-600 mr-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-semibold text-gray-800">WhatsApp</span>
                </a>
              )}

              {info.youtube && (
                <a href={info.youtube} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-red-300 hover:bg-red-50 transition-colors group">
                  <div className="bg-red-100 p-3 rounded-lg text-red-600 mr-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <Youtube className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-semibold text-gray-800">YouTube</span>
                </a>
              )}

              {info.tiktok && (
                <a href={info.tiktok} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-gray-400 hover:bg-gray-100 transition-colors group">
                  <div className="bg-gray-200 p-3 rounded-lg text-gray-800 mr-4 group-hover:bg-black group-hover:text-white transition-colors">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-semibold text-gray-800">TikTok</span>
                </a>
              )}

              {info.facebook && (
                <a href={info.facebook} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                  <div className="bg-blue-100 p-3 rounded-lg text-blue-700 mr-4 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-semibold text-gray-800">Facebook</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}