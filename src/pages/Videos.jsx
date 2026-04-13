import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

// ==========================================
// NUEVO: RENDERIZADOR INTELIGENTE DE EMBEDS
// Soluciona TikTok, Instagram, Twitter, etc.
// ==========================================
const SmartEmbed = ({ html }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // 1. Insertamos el HTML (el blockquote de TikTok)
    containerRef.current.innerHTML = html;
    
    // 2. Buscamos si el embed trajo un script (ej. embed.js de TikTok)
    const scripts = containerRef.current.querySelectorAll('script');
    
    // 3. Forzamos a React/Navegador a ejecutar esos scripts
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      if (script.src) {
        newScript.src = script.src;
        newScript.async = true;
      } else {
        newScript.innerHTML = script.innerHTML;
      }
      document.body.appendChild(newScript);
    });
  }, [html]);

  return (
    <div 
      ref={containerRef} 
      className="w-full overflow-hidden flex items-center justify-center bg-black/5 rounded-t-xl" 
      style={{ minHeight: '350px' }} 
    />
  );
};
// ==========================================


export default function Videos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const videosRef = collection(db, 'videos_mrexcel');
    const q = query(videosRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videosData = [];
      snapshot.forEach((doc) => {
        videosData.push({ id: doc.id, ...doc.data() });
      });
      videosData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setVideos(videosData);
      setLoading(false);
    }, (error) => {
      console.error("Error cargando videos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['Todas', ...new Set(videos.map(v => v.category).filter(Boolean))];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = (video.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (video.keywords?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Menú Lateral */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-emerald-500" />
              Herramientas
            </h3>
            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <button key={idx} onClick={() => setSelectedCategory(cat)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Área Principal de Videos */}
        <div className="w-full lg:w-3/4">
          <div className="mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" placeholder="Buscar por herramienta, función o palabra clave..." className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg">No se encontraron videos con esos filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVideos.map(video => (
                <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  
                  {/* AQUÍ ESTÁ EL CAMBIO: Usamos el renderizador inteligente */}
                  <SmartEmbed html={video.embedCode} />
                  
                  <div className="p-5 flex-1 flex flex-col border-t border-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-gray-900 line-clamp-2">{video.title}</h4>
                      {video.category && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 ml-2 whitespace-nowrap">{video.category}</span>}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{video.description}</p>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400">Tags: {video.keywords}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}