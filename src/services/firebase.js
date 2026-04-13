import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Aquí vas a poner TUS 6 claves reales entre las comillas
const firebaseConfig = {
  apiKey: "AIzaSyD-fqFt7tBkYoFXecjUVI1RsAej_jDwANY",
  authDomain: "mr-excel-365.firebaseapp.com",
  projectId: "mr-excel-365",
  storageBucket: "mr-excel-365.firebasestorage.app",
  messagingSenderId: "711467783844",
  appId: "1:711467783844:web:571301533e99d49946f831",
  measurementId: "G-JKG8D9Z138"
};

// ¡Estas líneas de abajo son súper importantes, no las borres!
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

signInAnonymously(auth).catch(console.error);