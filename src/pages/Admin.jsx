import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot, query } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Admin({ user }) {
  const [videos, setVideos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: '', description: '', keywords: '', embedCode: ''
  });

  // Cargar videos también en el panel de admin
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Settings className="w-5 h-5 mr-2" /> Panel de Administración
          </h2>
          <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">Modo Admin</span>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 border-r-0 lg:border-r border-gray-100 lg:pr-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="w-4 h-4 mr-1 text-blue-600" /> Nuevo Video
            </h3>
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input type="text" name="category" required value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Embed</label>
                <textarea name="embedCode" required value={formData.embedCode} onChange={handleInputChange} rows="4" className="w-full px-3 py-2 border rounded-md font-mono text-xs" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea name="description" required value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Palabras Clave (SEO)</label>
                <input type="text" name="keywords" required value={formData.keywords} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
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
                    <li key={video.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-bold text-gray-900 truncate">{video.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Categoría: {video.category}</p>
                      </div>
                      <button onClick={() => handleDeleteVideo(video.id)} className="p-2 text-gray-400 hover:text-red-600">
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