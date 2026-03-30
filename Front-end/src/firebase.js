import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDzjTJNpwPmNgLAHkB-zzgPSt2knxYSUtI',
  authDomain: 'movietrackerauth.firebaseapp.com',
  projectId: 'movietrackerauth',
  storageBucket: 'movietrackerauth.firebasestorage.app',
  messagingSenderId: '792428628530',
  appId: '1:792428628530:web:341a3e68f6f5320f88ca2b',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
