// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "[REDACTED]",
  authDomain: "vr-disaster-training-platform.firebaseapp.com",
  projectId: "vr-disaster-training-platform",
  storageBucket: "vr-disaster-training-platform.firebasestorage.app",
  messagingSenderId: "886547134036",
  appId: "1:886547134036:web:4db6ee264cc4bbd8985fc1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;