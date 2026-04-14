import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, LogIn, LogOut, User, Video, Save, Image as ImageIcon } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, setDoc, getDoc, serverTimestamp, onSnapshot, query } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../services/firebase';

export default function Admin({ user }) {
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
    
    // Cargar videos
    const unsubVideos = onSnapshot(query(collection(db, 'videos_mrexcel')), (snapshot) => {
      const videosData = [];
      snapshot.forEach((doc) => videosData.push({ id: doc.id, ...doc.data() }));
      setVideos(videosData);
    });
    
    // Cargar perfil con tus logos guardados
    const loadProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'config', 'perfil'));
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      } catch (error) {
        console.error("Error al cargar el perfil. Verifica tu conexión a Firebase.", error);
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
    } 
    catch (error) { 
      console.error(error);
      // Validación inteligente por si las claves de Firebase están mal puestas
      if (error.code === 'auth/invalid-api-key' || error.message.includes('API key')) {
        setLoginError('Error crítico: Tu archivo firebase.js no tiene tus verdaderas claves de conexión.');
      } else {
        setLoginError('Correo o contraseña incorrectos'); 
      }
    }
  };

  if (!user || user.isAnonymous) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6"><Settings className="w-12 h-12 text-emerald-600 mx-auto mb-2" /><h2 className="text-2xl font-bold text-gray-800">Acceso Privado</h2></div>
        {loginError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-600 rounded-lg text-center font-medium">
            {loginError}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Correo" />
          <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Contraseña" />
          <button type="submit" className="w-full py-3 text-white bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-lg font-bold">Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b flex justify-between items-center px-6">
          <div className="flex">
            <button onClick={() => setActiveTab('videos')} className={`px-6 py-4 text-sm font-bold flex items-center border-b-2 transition-colors ${activeTab === 'videos' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Video className="w-4 h-4 mr-2" /> Videos</button>
            <button onClick={() => setActiveTab('perfil')} className={`px-6 py-4 text-sm font-bold flex items-center border-b-2 transition-colors ${activeTab === 'perfil' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><User className="w-4 h-4 mr-2" /> Mi Marca</button>
          </div>
          <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-600 p-2" title="Cerrar Sesión"><LogOut className="w-5 h-5" /></button>
        </div>

        <div className="p-8">
          {activeTab === 'videos' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 border-r-0 lg:border-r border-gray-100 lg:pr-8">
                <h3 className="text-lg font-bold mb-4 flex items-center"><Plus className="w-4 h-4 mr-2 text-emerald-600" /> Nuevo Video</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault(); 
                  setIsSubmitting(true);
                  try {
                    await addDoc(collection(db, 'videos_mrexcel'), { ...formData, createdAt: serverTimestamp() });
                    setFormData({ title: '', category: '', description: '', keywords: '', embedCode: '' });
                    alert("¡Video publicado con éxito!");
                  } catch (error) {
                    alert("Error al publicar. Verifica tu conexión a internet.");
                    console.error(error);
                  } finally {
                    setIsSubmitting(false);
                  }
                }} className="space-y-4">
                  <input type="text" placeholder="Título" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                  <input type="text" placeholder="Categoría" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                  <textarea placeholder="Código Embed" required value={formData.embedCode} onChange={e => setFormData({...formData, embedCode: e.target.value})} className="w-full p-2.5 border rounded-lg font-mono text-xs outline-none focus:ring-2 focus:ring-emerald-500" rows="4" />
                  <textarea placeholder="Descripción" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" rows="3" />
                  <input type="text" placeholder="Keywords" required value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                    {isSubmitting ? 'Publicando...' : 'Publicar'}
                  </button>
                </form>
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold mb-4">Videos Publicados ({videos.length})</h3>
                <div className="border rounded-xl max-h-[500px] overflow-y-auto">
                  {videos.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">No hay videos publicados todavía.</p>
                  ) : (
                    videos.map(v => (
                      <div key={v.id} className="p-4 border-b flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div><p className="font-bold">{v.title}</p><p className="text-xs text-gray-500">{v.category}</p></div>
                        <button onClick={async () => { 
                          if(window.confirm("¿Estás seguro de que quieres borrar este video?")) {
                            try {
                              await deleteDoc(doc(db, 'videos_mrexcel', v.id));
                            } catch (error) {
                              alert("No se pudo borrar el video.");
                            }
                          } 
                        }} className="text-gray-300 hover:text-red-600 p-2"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Identidad Mr.Excel365</h3>
              <form onSubmit={async (e) => {
                e.preventDefault(); 
                setIsSubmitting(true);
                try {
                  await setDoc(doc(db, 'config', 'perfil'), profileData);
                  alert("Tus datos y logos se guardaron exitosamente."); 
                } catch (error) {
                  alert("Ocurrió un error al guardar los datos.");
                } finally {
                  setIsSubmitting(false);
                }
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={profileData.nombre} onChange={e => setProfileData({...profileData, nombre: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Tu Nombre Completo" />
                  <input type="text" value={profileData.titulo} onChange={e => setProfileData({...profileData, titulo: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Título Profesional" />
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 space-y-4">
                  <h4 className="font-bold text-gray-700 flex items-center"><ImageIcon className="w-4 h-4 mr-2" /> Recursos Visuales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" value={profileData.logoUrl || ''} onChange={e => setProfileData({...profileData, logoUrl: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" placeholder="URL Logo Circular" />
                    <input type="text" value={profileData.bannerUrl || ''} onChange={e => setProfileData({...profileData, bannerUrl: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" placeholder="URL Banner (Contacto)" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="email" placeholder="Correo Público" value={profileData.correo} onChange={e => setProfileData({...profileData, correo: e.target.value})} className="w-full p-3 border rounded-xl" />
                  <input type="text" placeholder="WhatsApp (Ej: 5939999999)" value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} className="w-full p-3 border rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" placeholder="TikTok URL" value={profileData.tiktok} onChange={e => setProfileData({...profileData, tiktok: e.target.value})} className="p-3 border rounded-xl text-sm" />
                  <input type="text" placeholder="YouTube URL" value={profileData.youtube} onChange={e => setProfileData({...profileData, youtube: e.target.value})} className="p-3 border rounded-xl text-sm" />
                  <input type="text" placeholder="Facebook URL" value={profileData.facebook} onChange={e => setProfileData({...profileData, facebook: e.target.value})} className="p-3 border rounded-xl text-sm" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-colors shadow-sm"><Save className="w-5 h-5 mr-2 inline" /> {isSubmitting ? 'Guardando...' : 'Guardar y Sincronizar Todo'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}