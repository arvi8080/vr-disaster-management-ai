// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAH6TpLRduoDUMjarCzYDh4ZrcCLaNl9Aw",
  authDomain: "vr-disaster-management-ai.firebaseapp.com",
  projectId: "vr-disaster-management-ai",
  storageBucket: "vr-disaster-management-ai.firebasestorage.app",
  messagingSenderId: "672037645403",
  appId: "1:672037645403:web:67611fcaff11093088e37e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;