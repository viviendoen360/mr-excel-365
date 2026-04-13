import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, LogIn, LogOut } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot, query } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../services/firebase';

export default function Admin({ user }) {
  const [videos, setVideos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [formData, setFormData] = useState({
    title: '', category: '', description: '', keywords: '', embedCode: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'videos_mrexcel'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videosData = [];
      snapshot.forEach((doc) => videosData.push({ id: doc.id, ...doc.data() }));
      setVideos(videosData);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (error) {
      setLoginError('Correo o contraseña incorrectos');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // VISTA DE LOGIN (Si no está logueado o es anónimo)
  if (!user || user.isAnonymous) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-sm border border-gray-200 animate-in fade-in">
        <div className="text-center mb-6">
          <Settings className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Acceso Privado</h2>
          <p className="text-sm text-gray-500">Solo para Mr.Excel365</p>
        </div>
        
        {loginError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{loginError}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" placeholder="ejemplo@correo.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 flex justify-center items-center transition-colors">
            <LogIn className="w-5 h-5 mr-2" /> Ingresar
          </button>
        </form>
      </div>
    );
  }

  // VISTA DE PANEL DE CONTROL (Si está logueado correctamente)
  const handleAddVideo = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'videos_mrexcel'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setFormData({ title: '', category: '', description: '', keywords: '', embedCode: '' });
      alert("Video publicado con éxito");
    } catch (error) {
      console.error("Error agregando video: ", error);
      alert("Hubo un error al publicar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este video?")) {
      try {
        await deleteDoc(doc(db, 'videos_mrexcel', id));
      } catch (error) {
        console.error("Error eliminando video: ", error);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Settings className="w-5 h-5 mr-2" /> Panel de Administración
          </h2>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">Admin: {user.email}</span>
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 border-r-0 lg:border-r border-gray-100 lg:pr-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="w-4 h-4 mr-1 text-blue-600" /> Nuevo Video
            </h3>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input type="text" name="category" required value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Embed</label>
                <textarea name="embedCode" required value={formData.embedCode} onChange={handleInputChange} rows="4" className="w-full px-3 py-2 border rounded-md font-mono text-xs focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea name="description" required value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Palabras Clave (SEO)</label>
                <input type="text" name="keywords" required value={formData.keywords} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {isSubmitting ? 'Guardando...' : 'Publicar Video'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Videos Publicados ({videos.length})</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {videos.length === 0 ? (
                  <li className="p-6 text-center text-gray-500 text-sm">No hay videos.</li>
                ) : (
                  videos.map(video => (
                    <li key={video.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center group">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-bold text-gray-900 truncate">{video.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Categoría: {video.category}</p>
                      </div>
                      <button onClick={() => handleDeleteVideo(video.id)} className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}