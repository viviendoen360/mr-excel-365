import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, LogIn, LogOut, User, Video, Save, Image as ImageIcon } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, setDoc, getDoc, serverTimestamp, onSnapshot, query } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../services/firebase';

export default function Admin({ user }) {
  const [activeTab, setActiveTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados para Videos
  const [formData, setFormData] = useState({
    title: '', category: '', description: '', keywords: '', embedCode: ''
  });

  // Estados para Perfil (Incluyendo Logo y Banner)
  const [profileData, setProfileData] = useState({
    nombre: '', 
    titulo: '', 
    correo: '', 
    whatsapp: '', 
    facebook: '', 
    youtube: '', 
    tiktok: '',
    logoUrl: '',
    bannerUrl: ''
  });

  useEffect(() => {
    if (!user || user.isAnonymous) return;

    // Cargar lista de videos
    const q = query(collection(db, 'videos_mrexcel'));
    const unsubVideos = onSnapshot(q, (snapshot) => {
      const videosData = [];
      snapshot.forEach((doc) => videosData.push({ id: doc.id, ...doc.data() }));
      setVideos(videosData);
    });

    // Cargar datos del perfil/marca
    const loadProfile = async () => {
      const docSnap = await getDoc(doc(db, 'config', 'perfil'));
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    };
    loadProfile();

    return () => unsubVideos();
  }, [user]);

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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'config', 'perfil'), profileData);
      alert("¡Identidad de marca actualizada con éxito!");
    } catch (error) {
      alert("Error al actualizar la configuración");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.isAnonymous) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <Settings className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Acceso Privado</h2>
          <p className="text-sm text-gray-500">Mr.Excel365 Admin</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Correo" />
          <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Contraseña" />
          <button type="submit" className="w-full py-3 text-white bg-emerald-600 rounded-lg font-bold">Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Menú de Pestañas Superior */}
        <div className="bg-gray-50 border-b flex justify-between items-center px-6">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-4 text-sm font-bold flex items-center border-b-2 transition-colors ${activeTab === 'videos' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Video className="w-4 h-4 mr-2" /> Gestionar Videos
            </button>
            <button 
              onClick={() => setActiveTab('perfil')}
              className={`px-6 py-4 text-sm font-bold flex items-center border-b-2 transition-colors ${activeTab === 'perfil' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <User className="w-4 h-4 mr-2" /> Mi Marca / Perfil
            </button>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors p-2" title="Cerrar Sesión">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'videos' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna Izquierda: Formulario de Videos */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-bold mb-4 flex items-center text-gray-800">
                  <Plus className="w-4 h-4 mr-2 text-emerald-600" /> Nuevo Video
                </h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  await addDoc(collection(db, 'videos_mrexcel'), { ...formData, createdAt: serverTimestamp() });
                  setFormData({ title: '', category: '', description: '', keywords: '', embedCode: '' });
                  setIsSubmitting(false);
                }} className="space-y-4">
                  <input type="text" placeholder="Título del Video" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                  <input type="text" placeholder="Categoría (ej: Tablas Dinámicas)" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                  <textarea placeholder="Código Embed (TikTok / YouTube)" required value={formData.embedCode} onChange={e => setFormData({...formData, embedCode: e.target.value})} className="w-full p-2.5 border rounded-lg font-mono text-xs outline-none focus:ring-2 focus:ring-emerald-500" rows="4" />
                  <textarea placeholder="Breve descripción" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" rows="3" />
                  <input type="text" placeholder="Keywords (separadas por comas)" required value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                    {isSubmitting ? 'Publicando...' : 'Publicar Video'}
                  </button>
                </form>
              </div>

              {/* Columna Derecha: Lista de Videos */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold mb-4">Lista de Videos ({videos.length})</h3>
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <div className="max-h-[500px] overflow-y-auto">
                    {videos.map(v => (
                      <div key={v.id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="font-bold text-gray-900 truncate">{v.title}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{v.category}</p>
                        </div>
                        <button onClick={async () => { if(confirm("¿Seguro que quieres borrar este video?")) await deleteDoc(doc(db, 'videos_mrexcel', v.id)) }} className="text-gray-300 hover:text-red-600 p-2 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SECCIÓN DE PERFIL Y MARCA */
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Identidad Mr.Excel365</h3>
                <div className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase">Configuración de Marca</div>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Datos Personales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-600 ml-1">Tu Nombre</label>
                    <input type="text" value={profileData.nombre} onChange={e => setProfileData({...profileData, nombre: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Econ. Xavier Rodriguez" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-600 ml-1">Título Profesional</label>
                    <input type="text" value={profileData.titulo} onChange={e => setProfileData({...profileData, titulo: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mtr. en Datos / Especialista SRI" />
                  </div>
                </div>

                {/* Logotipos y Banner */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 space-y-4">
                  <h4 className="font-bold text-gray-700 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" /> Recursos Visuales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">URL Logo Circular (Navbar)</label>
                      <input type="text" value={profileData.logoUrl || ''} onChange={e => setProfileData({...profileData, logoUrl: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm font-mono" placeholder="https://ejemplo.com/miphoto.png" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">URL Banner (Contacto)</label>
                      <input type="text" value={profileData.bannerUrl || ''} onChange={e => setProfileData({...profileData, bannerUrl: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm font-mono" placeholder="https://ejemplo.com/banner.png" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 italic">Pega enlaces directos a imágenes alojadas en la nube.</p>
                </div>

                {/* Enlaces y Redes */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700 border-b pb-1">Canales de Comunicación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="email" placeholder="Correo Electrónico" value={profileData.correo} onChange={e => setProfileData({...profileData, correo: e.target.value})} className="w-full p-3 border rounded-xl" />
                    <input type="text" placeholder="WhatsApp (Ej: 593999999999)" value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" placeholder="TikTok URL" value={profileData.tiktok} onChange={e => setProfileData({...profileData, tiktok: e.target.value})} className="p-3 border rounded-xl text-sm" />
                    <input type="text" placeholder="YouTube URL" value={profileData.youtube} onChange={e => setProfileData({...profileData, youtube: e.target.value})} className="p-3 border rounded-xl text-sm" />
                    <input type="text" placeholder="Facebook URL" value={profileData.facebook} onChange={e => setProfileData({...profileData, facebook: e.target.value})} className="p-3 border rounded-xl text-sm" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex justify-center items-center">
                  <Save className="w-5 h-5 mr-2" /> {isSubmitting ? 'Guardando...' : 'Guardar y Sincronizar Todo'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}