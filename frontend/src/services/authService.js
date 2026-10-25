import { api } from './api';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export const authService = {
  getMe: async () => {
    try {
      const res = await api('/auth/me');
      return res.data;
    } catch (err) {
      console.warn("Backend /auth/me fetch error:", err);
      throw err;
    }
  },

  login: async (email, password) => {
    // 1. Authenticate identity with Firebase Authentication SDK
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    localStorage.setItem('firebaseIdToken', idToken);

    // 2. Fetch authenticated profile & role strictly from backend /auth/me
    const userProfile = await authService.getMe();
    return userProfile;
  },

  signup: async (name, email, password, requestTrainer = false) => {
    // 1. Create Firebase user identity
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    localStorage.setItem('firebaseIdToken', idToken);

    // 2. Provision Firestore profile on backend with default role 'trainee' & optional trainer request
    await api('/users/profile', {
      method: 'POST',
      body: JSON.stringify({
        name,
        requestTrainer: Boolean(requestTrainer)
      })
    });

    // 3. Fetch authenticated profile & role from backend
    const userProfile = await authService.getMe();
    return userProfile;
  },

  logout: async () => {
    await signOut(auth);
    localStorage.removeItem('firebaseIdToken');
  }
};