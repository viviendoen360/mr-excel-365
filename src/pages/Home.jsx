import React, { useState } from 'react';
import { Play, Mail, ShieldCheck } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Home({ setCurrentView }) {
  const [subData, setSubData] = useState({ nombre: '', email: '', terminos: false });
  const [subStatus, setSubStatus] = useState('idle'); 

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!subData.terminos) {
      alert("Debes aceptar la Política de Privacidad (LOPDP) para continuar.");
      return;
    }

    setSubStatus('submitting');
    
    try {
      // Guarda los correos directamente en tu Firebase
      const suscriptoresRef = collection(db, 'suscriptores');
      await addDoc(suscriptoresRef, {
        nombre: subData.nombre,
        email: subData.email,
        fechaSuscripcion: serverTimestamp(),
        origen: 'formulario_web'
      });
      
      setSubStatus('success');
      setSubData({ nombre: '', email: '', terminos: false });
      
    } catch (error) {
      console.error("Error al suscribir:", error);
      setSubStatus('error');
      alert("Hubo un error al suscribirte. Intenta nuevamente.");
    }
  };

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
            <div className="p-10 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-6 -top-6 opacity-10">
                <Mail className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Únete a la comunidad</h2>
                <p className="text-emerald-100 mb-6">Recibe notificaciones de nuevos videos, plantillas exclusivas y trucos semanales directamente en tu correo.</p>
                <div className="flex items-center space-x-2 text-emerald-200 text-sm font-medium">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Cumplimiento LOPDP Ecuador 🇪🇨</span>
                </div>
              </div>
            </div>
            <div className="p-10 flex items-center justify-center">
              <form className="w-full space-y-5" onSubmit={handleSubscribe}>
                
                {subStatus === 'success' ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center animate-in zoom-in duration-300">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">¡Suscripción Exitosa!</h3>
                    <p className="text-sm">Tus datos han sido guardados de forma segura. Pronto recibirás nuestros correos.</p>
                    <button type="button" onClick={() => setSubStatus('idle')} className="mt-4 text-emerald-600 text-sm font-semibold hover:underline">
                      Suscribir otro correo
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input type="text" required value={subData.nombre} onChange={(e) => setSubData({...subData, nombre: e.target.value})} placeholder="Escribe tu nombre" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                      <input type="email" required value={subData.email} onChange={(e) => setSubData({...subData, email: e.target.value})} placeholder="tu@correo.com" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                    </div>
                    
                    <div className="flex items-start">
                      <input type="checkbox" id="terms" required checked={subData.terminos} onChange={(e) => setSubData({...subData, terminos: e.target.checked})} className="mt-1 mr-3 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" />
                      <label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                        He leído y acepto la{' '}
                        <button type="button" onClick={() => setCurrentView('privacidad')} className="font-bold text-blue-600 hover:underline">
                          Política de Privacidad
                        </button>{' '}
                        según la LOPDP de Ecuador para recibir correos.
                      </label>
                    </div>

                    <button type="submit" disabled={subStatus === 'submitting'} className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-70 disabled:cursor-not-allowed">
                      {subStatus === 'submitting' ? 'Asegurando tus datos...' : 'Unirme a la comunidad'}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}