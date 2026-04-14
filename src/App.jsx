import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Settings, Home as HomeIcon, Video, Mail, Trash2, Plus, Filter, Menu, X, BookOpen, ShieldCheck, User, LogIn, LogOut, Save, Image as ImageIcon, MessageCircle, Youtube, Facebook, Smartphone } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';

// ==========================================
// 1. CONFIGURACIÓN DE FIREBASE (Unificada)
// ==========================================

// Soporte dual: Entorno de pruebas (Canvas) y tu entorno local (VS Code)
const isCanvas = typeof __app_id !== 'undefined';
const appId = isCanvas ? __app_id : 'mrexcel-app';

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      // ¡IMPORTANTE! Reemplaza esto con tus credenciales reales en tu VS Code
      apiKey: "PEGAR_AQUI_API_KEY",
      authDomain: "PEGAR_AQUI_AUTHDOMAIN",
      projectId: "mr-excel-365",
      storageBucket: "PEGAR_AQUI_STORAGE",
      messagingSenderId: "PEGAR_AQUI_MESSAGING",
      appId: "PEGAR_AQUI_APPID"
    };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Funciones para que las rutas de datos funcionen perfectamente en ambos entornos
const getColPath = (colName) => isCanvas ? `artifacts/${appId}/public/data/${colName}` : colName;
const getDocPath = (colName, docId) => isCanvas ? `artifacts/${appId}/public/data/${colName}/${docId}` : `${colName}/${docId}`;

// ==========================================
// 2. COMPONENTES DE LA INTERFAZ
// ==========================================

// --- SmartEmbed: Fuerza la carga segura de videos de TikTok y YouTube ---
const SmartEmbed = ({ html }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !html) return;
    
    containerRef.current.innerHTML = html;
    const scripts = containerRef.current.querySelectorAll('script');
    
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
      className="w-full flex items-center justify-center bg-gray-50 rounded-t-xl overflow-hidden" 
      style={{ minHeight: '300px' }} 
    />
  );
};

// --- Navbar ---
const Navbar = ({ currentView, setCurrentView, logoUrl }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="w-10 h-10 rounded-lg overflow-hidden mr-2 shadow-sm flex items-center justify-center bg-gradient-to-br from-emerald-500 to-blue-600">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xl">X</span>
              )}
            </div>
            <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 tracking-tight">
              Mr.Excel365
            </span>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <button onClick={() => setCurrentView('home')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'home' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'}`}>
              <HomeIcon className="w-4 h-4 mr-1" /> Inicio
            </button>
            <button onClick={() => setCurrentView('videos')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'videos' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}>
              <Video className="w-4 h-4 mr-1" /> Videos
            </button>
            <button onClick={() => setCurrentView('contacto')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'contacto' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'}`}>
              <User className="w-4 h-4 mr-1" /> Contacto
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
            <button onClick={() => { setCurrentView('contacto'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">Contacto</button>
            <button onClick={() => { setCurrentView('admin'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Administrador</button>
          </div>
        </div>
      )}
    </nav>
  );
};

// --- Home (Inicio) con Suscripción LOPDP ---
const Home = ({ setCurrentView, user }) => {
  const [subData, setSubData] = useState({ nombre: '', email: '', terminos: false });
  const [subStatus, setSubStatus] = useState('idle'); 

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Conectando con el servidor, por favor espera un momento.");
      return;
    }
    if (!subData.terminos) {
      alert("Debes aceptar la Política de Privacidad (LOPDP) para continuar.");
      return;
    }

    setSubStatus('submitting');
    try {
      const suscriptoresRef = collection(db, getColPath('suscriptores'));
      await addDoc(suscriptoresRef, {
        nombre: subData.nombre,
        email: subData.email,
        fechaSuscripcion: serverTimestamp(),
        origen: 'formulario_web'
      });
      setSubStatus('success');
      setSubData({ nombre: '', email: '', terminos: false });
    } catch (error) {
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
                        He leído y acepto la <button type="button" onClick={() => setCurrentView('privacidad')} className="font-bold text-blue-600 hover:underline">Política de Privacidad</button> según la LOPDP de Ecuador.
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
};

// --- Videos ---
const Videos = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, getColPath('videos_mrexcel')));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videosData = [];
      snapshot.forEach((doc) => videosData.push({ id: doc.id, ...doc.data() }));
      videosData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setVideos(videosData);
      setLoading(false);
    }, (error) => {
      console.error("Error cargando videos:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const categories = ['Todas', ...new Set(videos.map(v => v.category).filter(Boolean))];
  const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.trim() !== '');

  const filteredVideos = videos.filter(video => {
    const title = (video.title || '').toLowerCase();
    const keywords = (video.keywords || '').toLowerCase();
    const matchesSearch = searchWords.length === 0 || searchWords.every(word => title.includes(word) || keywords.includes(word));
    const matchesCategory = selectedCategory === 'Todas' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Filter className="w-5 h-5 mr-2 text-emerald-500" />Herramientas</h3>
            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <button key={idx} onClick={() => setSelectedCategory(cat)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>{cat}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-3/4">
          <div className="mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
            <input type="text" placeholder="Buscar por herramienta, función o palabra clave..." className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
          ) : filteredVideos.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500"><BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-lg">No se encontraron videos con esos filtros.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVideos.map(video => (
                <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <SmartEmbed html={video.embedCode} />
                  <div className="p-5 flex-1 flex flex-col border-t border-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-gray-900 line-clamp-2">{video.title}</h4>
                      {video.category && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 ml-2 whitespace-nowrap">{video.category}</span>}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{video.description}</p>
                    <div className="mt-auto pt-4 border-t border-gray-100"><p className="text-xs text-gray-400">Tags: {video.keywords}</p></div>
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

// --- Contacto ---
const Contacto = ({ config }) => {
  if (!config || Object.keys(config).length === 0) {
    return <div className="text-center py-20 text-gray-500">Configura tu perfil en el panel de Administrador.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-emerald-500 to-blue-600">
          {config.bannerUrl && <img src={config.bannerUrl} alt="Banner" className="w-full h-full object-cover" />}
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-1 shadow-xl border-4 border-white overflow-hidden flex items-center justify-center">
              {config.logoUrl ? <img src={config.logoUrl} alt="Profile" className="w-full h-full object-cover rounded-full" /> : <span className="text-3xl font-bold text-emerald-600">XR</span>}
            </div>
          </div>
        </div>

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
};

// --- Privacidad ---
const Privacidad = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
    <h1 className="text-3xl font-bold mb-6 text-emerald-700">Política de Privacidad - Mr.Excel365</h1>
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4 text-sm leading-relaxed">
      <p><strong>Responsable:</strong> Econ. Xavier Rodriguez Torres</p>
      <p>En cumplimiento con la <strong>Ley Orgánica de Protección de Datos Personales de Ecuador</strong>, le informamos que sus datos (nombre y correo) serán tratados con la única finalidad de enviarle actualizaciones educativas sobre Excel y herramientas de datos.</p>
      <h2 className="text-lg font-bold mt-6 text-gray-900">Finalidad del Tratamiento</h2>
      <p>Utilizaremos su correo electrónico exclusivamente para enviar nuestro boletín de noticias (Newsletter) que incluye: alertas de nuevos videos tutoriales, plantillas descargables y trucos de productividad en Excel.</p>
      <h2 className="text-lg font-bold mt-6 text-gray-900">Sus Derechos</h2>
      <p>Usted tiene derecho al acceso, eliminación, rectificación y oposición al tratamiento de sus datos. Puede ejercer estos derechos en cualquier momento enviando un correo electrónico solicitando la baja a: <em>econ.xavier.rodriguez@gmail.com</em>.</p>
    </div>
  </div>
);

// --- Admin ---
const Admin = ({ user }) => {
  const [activeTab, setActiveTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [formData, setFormData] = useState({ title: '', category: '', description: '', keywords: '', embedCode: '' });
  const [profileData, setProfileData] = useState({ nombre: '', titulo: '', correo: '', whatsapp: '', facebook: '', youtube: '', tiktok: '', logoUrl: '', bannerUrl: '' });

  useEffect(() => {
    if (!user || user.isAnonymous) return;
    const unsubVideos = onSnapshot(query(collection(db, getColPath('videos_mrexcel'))), (snapshot) => {
      const videosData = [];
      snapshot.forEach((doc) => videosData.push({ id: doc.id, ...doc.data() }));
      setVideos(videosData);
    });
    
    const loadProfile = async () => {
      const docSnap = await getDoc(doc(db, getDocPath('config', 'perfil')));
      if (docSnap.exists()) setProfileData(docSnap.data());
    };
    loadProfile();

    return () => unsubVideos();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPassword); } 
    catch (error) { setLoginError('Correo o contraseña incorrectos'); }
  };

  if (!user || user.isAnonymous) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6"><Settings className="w-12 h-12 text-emerald-600 mx-auto mb-2" /><h2 className="text-2xl font-bold text-gray-800">Acceso Privado</h2></div>
        {loginError && <div className="mb-4 text-sm text-red-600 text-center">{loginError}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" placeholder="Correo" />
          <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none" placeholder="Contraseña" />
          <button type="submit" className="w-full py-3 text-white bg-emerald-600 rounded-lg font-bold">Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b flex justify-between items-center px-6">
          <div className="flex">
            <button onClick={() => setActiveTab('videos')} className={`px-6 py-4 text-sm font-bold flex items-center border-b-2 transition-colors ${activeTab === 'videos' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-500'}`}><Video className="w-4 h-4 mr-2" /> Videos</button>
            <button onClick={() => setActiveTab('perfil')} className={`px-6 py-4 text-sm font-bold flex items-center border-b-2 transition-colors ${activeTab === 'perfil' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500'}`}><User className="w-4 h-4 mr-2" /> Perfil</button>
          </div>
          <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-600 p-2"><LogOut className="w-5 h-5" /></button>
        </div>

        <div className="p-8">
          {activeTab === 'videos' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-bold mb-4 flex items-center"><Plus className="w-4 h-4 mr-2 text-emerald-600" /> Nuevo Video</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault(); setIsSubmitting(true);
                  await addDoc(collection(db, getColPath('videos_mrexcel')), { ...formData, createdAt: serverTimestamp() });
                  setFormData({ title: '', category: '', description: '', keywords: '', embedCode: '' });
                  setIsSubmitting(false);
                }} className="space-y-4">
                  <input type="text" placeholder="Título" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" />
                  <input type="text" placeholder="Categoría" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" />
                  <textarea placeholder="Código Embed" required value={formData.embedCode} onChange={e => setFormData({...formData, embedCode: e.target.value})} className="w-full p-2.5 border rounded-lg font-mono text-xs outline-none" rows="4" />
                  <textarea placeholder="Descripción" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" rows="3" />
                  <input type="text" placeholder="Keywords" required value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" />
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Publicar</button>
                </form>
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold mb-4">Videos Publicados ({videos.length})</h3>
                <div className="border rounded-xl max-h-[500px] overflow-y-auto">
                  {videos.map(v => (
                    <div key={v.id} className="p-4 border-b flex justify-between items-center hover:bg-gray-50">
                      <div><p className="font-bold">{v.title}</p><p className="text-xs text-gray-500">{v.category}</p></div>
                      <button onClick={async () => { if(confirm("¿Borrar?")) await deleteDoc(doc(db, getDocPath('videos_mrexcel', v.id))) }} className="text-gray-300 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-6">Identidad Mr.Excel365</h3>
              <form onSubmit={async (e) => {
                e.preventDefault(); setIsSubmitting(true);
                await setDoc(doc(db, getDocPath('config', 'perfil')), profileData);
                alert("Guardado exitosamente."); setIsSubmitting(false);
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={profileData.nombre} onChange={e => setProfileData({...profileData, nombre: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Nombre" />
                  <input type="text" value={profileData.titulo} onChange={e => setProfileData({...profileData, titulo: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Título" />
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 space-y-4">
                  <h4 className="font-bold flex items-center"><ImageIcon className="w-4 h-4 mr-2" /> Recursos Visuales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" value={profileData.logoUrl || ''} onChange={e => setProfileData({...profileData, logoUrl: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" placeholder="URL Logo Circular" />
                    <input type="text" value={profileData.bannerUrl || ''} onChange={e => setProfileData({...profileData, bannerUrl: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" placeholder="URL Banner" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="email" placeholder="Correo" value={profileData.correo} onChange={e => setProfileData({...profileData, correo: e.target.value})} className="w-full p-3 border rounded-xl" />
                  <input type="text" placeholder="WhatsApp" value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" placeholder="TikTok URL" value={profileData.tiktok} onChange={e => setProfileData({...profileData, tiktok: e.target.value})} className="p-3 border rounded-xl text-sm" />
                  <input type="text" placeholder="YouTube URL" value={profileData.youtube} onChange={e => setProfileData({...profileData, youtube: e.target.value})} className="p-3 border rounded-xl text-sm" />
                  <input type="text" placeholder="Facebook URL" value={profileData.facebook} onChange={e => setProfileData({...profileData, facebook: e.target.value})} className="p-3 border rounded-xl text-sm" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold"><Save className="w-5 h-5 mr-2 inline" /> Guardar Todo</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. APLICACIÓN PRINCIPAL (Cerebro)
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({});

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Error inicializando auth:", error);
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribeConfig = onSnapshot(doc(db, getDocPath('config', 'perfil')), (docSnap) => {
      if (docSnap.exists()) setConfig(docSnap.data());
    });
    return () => unsubscribeConfig();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} logoUrl={config.logoUrl} />
      
      <main>
        {currentView === 'home' && <Home setCurrentView={setCurrentView} user={user} />}
        {currentView === 'videos' && <Videos user={user} />}
        {currentView === 'admin' && <Admin user={user} />}
        {currentView === 'contacto' && <Contacto config={config} />}
        {currentView === 'privacidad' && <Privacidad />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <p className="text-gray-500 text-sm mb-3">© {new Date().getFullYear()} Mr.Excel365. Todos los derechos reservados.</p>
          <button onClick={() => setCurrentView('privacidad')} className="text-xs font-semibold text-blue-600 hover:text-emerald-600 hover:underline transition-colors flex items-center">
            <ShieldCheck className="w-3 h-3 mr-1" /> Política de Privacidad y Protección de Datos (LOPDP)
          </button>
        </div>
      </footer>
    </div>
  );
}