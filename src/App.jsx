import React, { useState, useEffect } from 'react';
import { Search, Play, Settings, Home, Video, Mail, Trash2, Plus, Filter, Menu, X, BookOpen, ShieldCheck } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

// ==========================================
// 1. CONFIGURACIÓN DE FIREBASE Y BASE DE DATOS
// ==========================================
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mrexcel-app';

export default function App() {
  // Estados de navegación y usuario
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados de datos
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // 2. AUTENTICACIÓN Y LECTURA DE DATOS
  // ==========================================
  useEffect(() => {
    // Iniciar sesión (Anónima o con Token provisto por el entorno)
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Error de autenticación:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Cargar videos desde la base de datos
    if (!user) return;

    const videosRef = collection(db, 'artifacts', appId, 'public', 'data', 'videos');
    const q = query(videosRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videosData = [];
      snapshot.forEach((doc) => {
        videosData.push({ id: doc.id, ...doc.data() });
      });
      // Ordenar por fecha de creación localmente (más recientes primero)
      videosData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setVideos(videosData);
      setLoading(false);
    }, (error) => {
      console.error("Error cargando videos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // ==========================================
  // 3. COMPONENTES DE LA INTERFAZ (Módulos)
  // ==========================================

  // --- MÓDULO: Barra de Navegación ---
  const Navbar = () => (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
            {/* LOGO: Mezcla moderna de Verde y Azul */}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 text-white font-bold text-xl mr-2 shadow-sm">
              X
            </div>
            <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 tracking-tight">
              Mr.Excel365
            </span>
          </div>
          
          {/* Menú Desktop */}
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

          {/* Botón Menú Mobile */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-gray-900 focus:outline-none">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Mobile Desplegable */}
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

  // --- MÓDULO: Página de Inicio (Con Suscripción LOPDP) ---
  const HomeView = () => {
    const [subData, setSubData] = useState({ nombre: '', email: '', terminos: false });
    const [subStatus, setSubStatus] = useState('idle'); // idle, submitting, success, error

    const handleSubscribe = async (e) => {
      e.preventDefault();
      
      if (!user) {
        alert("Sistema iniciando, por favor espera un momento.");
        return;
      }
      
      if (!subData.terminos) {
        alert("Debes aceptar la Política de Privacidad (LOPDP) para continuar.");
        return;
      }

      setSubStatus('submitting');
      
      try {
        const suscriptoresRef = collection(db, 'artifacts', appId, 'public', 'data', 'suscriptores');
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
        {/* Hero Section */}
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

        {/* Newsletter Section para Usuarios */}
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
                        <input 
                          type="text" 
                          required 
                          value={subData.nombre}
                          onChange={(e) => setSubData({...subData, nombre: e.target.value})}
                          placeholder="Escribe tu nombre" 
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <input 
                          type="email" 
                          required 
                          value={subData.email}
                          onChange={(e) => setSubData({...subData, email: e.target.value})}
                          placeholder="tu@correo.com" 
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" 
                        />
                      </div>
                      
                      {/* Casilla LOPDP */}
                      <div className="flex items-start">
                        <input 
                          type="checkbox" 
                          id="terms" 
                          required
                          checked={subData.terminos}
                          onChange={(e) => setSubData({...subData, terminos: e.target.checked})}
                          className="mt-1 mr-3 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" 
                        />
                        <label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                          He leído y acepto la{' '}
                          <button 
                            type="button" 
                            onClick={() => setCurrentView('privacidad')} 
                            className="font-bold text-blue-600 hover:underline"
                          >
                            Política de Privacidad
                          </button>{' '}
                          y el tratamiento de mis datos personales según la LOPDP de Ecuador para recibir correos de Mr.Excel365.
                        </label>
                      </div>

                      <button 
                        type="submit" 
                        disabled={subStatus === 'submitting'}
                        className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-70 disabled:cursor-not-allowed"
                      >
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
  };

  // --- MÓDULO: Catálogo de Videos ---
  const VideosView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    // Extraer categorías únicas de los videos
    const categories = ['Todas', ...new Set(videos.map(v => v.category).filter(Boolean))];

    // Filtrar videos por búsqueda y categoría
    const filteredVideos = videos.filter(video => {
      const matchesSearch = (video.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                            (video.keywords?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || video.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Menú Lateral de Herramientas */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-emerald-500" />
                Herramientas
              </h3>
              <div className="space-y-2">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Área Principal de Videos */}
          <div className="w-full lg:w-3/4">
            {/* Buscador */}
            <div className="mb-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por herramienta, función o palabra clave..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm shadow-sm transition-shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Grid de Videos */}
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
                  <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    {/* Contenedor del Iframe/Embed */}
                    <div 
                      className="w-full bg-gray-50 flex items-center justify-center p-4" 
                      style={{ minHeight: '300px' }}
                      dangerouslySetInnerHTML={{ __html: video.embedCode }}
                    />
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-gray-900 line-clamp-2">{video.title}</h4>
                        {video.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 ml-2 whitespace-nowrap">
                            {video.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{video.description}</p>
                      
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          Tags: {video.keywords}
                        </p>
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
  };

  // --- MÓDULO: Panel de Administrador ---
  const AdminView = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      title: '',
      category: '',
      description: '',
      keywords: '',
      embedCode: ''
    });

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddVideo = async (e) => {
      e.preventDefault();
      if (!user) return;
      setIsSubmitting(true);
      try {
        const videosRef = collection(db, 'artifacts', appId, 'public', 'data', 'videos');
        await addDoc(videosRef, {
          ...formData,
          createdAt: serverTimestamp()
        });
        setFormData({ title: '', category: '', description: '', keywords: '', embedCode: '' });
      } catch (error) {
        console.error("Error agregando video: ", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleDeleteVideo = async (id) => {
      if (!user) return;
      // Nota: En un entorno real usarías confirm(), aquí usamos borrado directo o UI custom.
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'videos', id));
      } catch (error) {
        console.error("Error eliminando video: ", error);
      }
    };

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Settings className="w-5 h-5 mr-2" /> Panel de Administración
            </h2>
            <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">Modo Admin Activo</span>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario para agregar video */}
            <div className="lg:col-span-1 border-r-0 lg:border-r border-gray-100 lg:pr-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Plus className="w-4 h-4 mr-1 text-blue-600" /> Nuevo Video
              </h3>
              <form onSubmit={handleAddVideo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título del Video</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none" placeholder="Ej: Tablas Dinámicas paso a paso" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría (Herramienta)</label>
                  <input type="text" name="category" required value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none" placeholder="Ej: Tablas Dinámicas, Fórmulas..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código Embed (TikTok/YouTube)</label>
                  <textarea name="embedCode" required value={formData.embedCode} onChange={handleInputChange} rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none font-mono text-xs" placeholder='<iframe src="..."></iframe>' />
                  <p className="text-xs text-gray-500 mt-1">Pega aquí el código HTML que te da TikTok o YouTube.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea name="description" required value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none" placeholder="Breve descripción de lo que enseñas en este video..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Palabras Clave (SEO)</label>
                  <input type="text" name="keywords" required value={formData.keywords} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none" placeholder="excel, tutorial, tablas dinamicas (separadas por coma)" />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50">
                  {isSubmitting ? 'Guardando...' : 'Publicar Video'}
                </button>
              </form>
            </div>

            {/* Lista de videos subidos */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Videos Publicados ({videos.length})</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {videos.length === 0 ? (
                    <li className="p-6 text-center text-gray-500 text-sm">No has subido ningún video aún.</li>
                  ) : (
                    videos.map(video => (
                      <li key={video.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center group">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-bold text-gray-900 truncate">{video.title}</p>
                          <p className="text-xs text-gray-500 mt-1">Categoría: {video.category}</p>
                          <p className="text-xs text-gray-400 mt-1 truncate">{video.keywords}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteVideo(video.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
                          title="Eliminar Video"
                        >
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
  };

  // --- MÓDULO: Página de Privacidad LOPDP ---
  const PrivacidadView = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-6 text-emerald-700">Política de Privacidad - Mr.Excel365</h1>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4 text-sm leading-relaxed">
        <p><strong>Responsable:</strong> Econ. Xavier Rodriguez Torres</p>
        <p>En cumplimiento con la <strong>Ley Orgánica de Protección de Datos Personales de Ecuador</strong>, le informamos que sus datos (nombre y correo) serán tratados con la única finalidad de enviarle actualizaciones educativas sobre Excel y herramientas de datos.</p>
        
        <h2 className="text-lg font-bold mt-6 text-gray-900">Finalidad del Tratamiento</h2>
        <p>Utilizaremos su correo electrónico exclusivamente para enviar nuestro boletín de noticias (Newsletter) que incluye: alertas de nuevos videos tutoriales, plantillas descargables y trucos de productividad en Excel.</p>
        
        <h2 className="text-lg font-bold mt-6 text-gray-900">Sus Derechos</h2>
        <p>Usted tiene derecho al acceso, eliminación, rectificación y oposición al tratamiento de sus datos. Puede ejercer estos derechos en cualquier momento enviando un correo electrónico solicitando la baja a: <em>econ.xavier.rodriguez@gmail.com</em>.</p>
        
        <h2 className="text-lg font-bold mt-6 text-gray-900">Conservación y Seguridad</h2>
        <p>Los datos se conservarán mientras exista un interés mutuo para mantener el fin del tratamiento. Sus datos están asegurados mediante encriptación en bases de datos gestionadas por Google (Firebase) y no serán vendidos ni transferidos a terceros con fines comerciales.</p>
      </div>
    </div>
  );

  // ==========================================
  // RENDERIZADO PRINCIPAL
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />
      
      <main>
        {currentView === 'home' && <HomeView />}
        {currentView === 'videos' && <VideosView />}
        {currentView === 'admin' && <AdminView />}
        {currentView === 'privacidad' && <PrivacidadView />}
      </main>

      {/* Footer Legal */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <p className="text-gray-500 text-sm mb-3">
            © {new Date().getFullYear()} Mr.Excel365. Todos los derechos reservados.
          </p>
          <button 
            onClick={() => setCurrentView('privacidad')} 
            className="text-xs font-semibold text-blue-600 hover:text-emerald-600 hover:underline transition-colors flex items-center"
          >
            <ShieldCheck className="w-3 h-3 mr-1" />
            Política de Privacidad y Protección de Datos (LOPDP)
          </button>
        </div>
      </footer>
    </div>
  );
}