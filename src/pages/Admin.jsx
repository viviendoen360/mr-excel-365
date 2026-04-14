import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, LogIn, LogOut, User, Video, Save } from 'lucide-react';
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

  // Estados para Perfil
  const [profileData, setProfileData] = useState({
    nombre: '', titulo: '', correo: '', whatsapp: '', facebook: '', youtube: '', tiktok: ''
  });

  useEffect(() => {
    if (!user || user.isAnonymous) return;

    // Cargar videos
    const q = query(collection(db, 'videos_mrexcel'));
    const unsubVideos = onSnapshot(q, (snapshot) => {
      const videosData = [];
      snapshot.forEach((doc) => videosData.push({ id: doc.id, ...doc.data() }));
      setVideos(videosData);
    });

    // Cargar datos de perfil
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
      alert("¡Perfil actualizado con éxito!");
    } catch (error) {
      alert("Error al actualizar perfil");
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
        {/* Header con Pestañas */}
        <div className="bg-gray-50 border-b flex justify-between items-center px-6">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-4 text-sm font-bold flex items-center border-b-2 transition-colors ${activeTab === 'videos' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Video className="w-4 h-4 mr-2" /> Videos
            </button>
            <button 
              onClick={() => setActiveTab('perfil')}
              className={`px-6 py-4 text-sm font-bold flex items-center border-b-2 transition-colors ${activeTab === 'perfil' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <User className="w-4 h-4 mr-2" /> Mi Perfil / Contacto
            </button>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors"><LogOut className="w-5 h-5" /></button>
        </div>

        <div className="p-8">
          {activeTab === 'videos' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulario Videos - Igual que antes */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-bold mb-4">Nuevo Video</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  await addDoc(collection(db, 'videos_mrexcel'), { ...formData, createdAt: serverTimestamp() });
                  setFormData({ title: '', category: '', description: '', keywords: '', embedCode: '' });
                  setIsSubmitting(false);
                }} className="space-y-4">
                  <input type="text" placeholder="Título" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded" />
                  <input type="text" placeholder="Categoría" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded" />
                  <textarea placeholder="Código Embed" required value={formData.embedCode} onChange={e => setFormData({...formData, embedCode: e.target.value})} className="w-full p-2 border rounded font-mono text-xs" rows="4" />
                  <textarea placeholder="Descripción" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded" rows="3" />
                  <input type="text" placeholder="Keywords" required value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full p-2 border rounded" />
                  <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-blue-600 text-white rounded font-bold">Publicar Video</button>
                </form>
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold mb-4">Videos ({videos.length})</h3>
                <div className="border rounded-lg overflow-hidden">
                  {videos.map(v => (
                    <div key={v.id} className="p-3 border-b flex justify-between items-center hover:bg-gray-50">
                      <div><p className="font-bold text-sm">{v.title}</p><p className="text-xs text-gray-500">{v.category}</p></div>
                      <button onClick={async () => { if(confirm("¿Borrar?")) await deleteDoc(doc(db, 'videos_mrexcel', v.id)) }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* NUEVA SECCIÓN: FORMULARIO DE PERFIL */
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
                <User className="mr-2 text-blue-600" /> Configuración de Contacto
              </h3>
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input type="text" value={profileData.nombre} onChange={e => setProfileData({...profileData, nombre: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Econ. Xavier Rodriguez" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título / Profesión</label>
                    <input type="text" value={profileData.titulo} onChange={e => setProfileData({...profileData, titulo: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Econ. Xavier Rodriguez Torres, Mtr." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input type="email" value={profileData.correo} onChange={e => setProfileData({...profileData, correo: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="tu@correo.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (Solo números + código de país)</label>
                  <input type="text" value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} className="w-full p-2.5 border rounded-lg" placeholder="593999999999" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="URL TikTok" value={profileData.tiktok} onChange={e => setProfileData({...profileData, tiktok: e.target.value})} className="p-2.5 border rounded-lg text-sm" />
                  <input type="text" placeholder="URL YouTube" value={profileData.youtube} onChange={e => setProfileData({...profileData, youtube: e.target.value})} className="p-2.5 border rounded-lg text-sm" />
                  <input type="text" placeholder="URL Facebook" value={profileData.facebook} onChange={e => setProfileData({...profileData, facebook: e.target.value})} className="p-2.5 border rounded-lg text-sm" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex justify-center items-center">
                  <Save className="w-5 h-5 mr-2" /> {isSubmitting ? 'Guardando...' : 'Guardar Todos los Cambios'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}