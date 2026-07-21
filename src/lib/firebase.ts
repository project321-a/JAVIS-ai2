import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzSf7OmFAN43kldk3l2_5QxRWtCZlhEig",
  authDomain: "gen-lang-client-0861691992.firebaseapp.com",
  projectId: "gen-lang-client-0861691992",
  storageBucket: "gen-lang-client-0861691992.firebasestorage.app",
  messagingSenderId: "265421862835",
  appId: "1:265421862835:web:db401b0cf42986ff72fdc6"
};

// Initialize app (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if specified
export const db = getFirestore(app, "ai-studio-jarvispersonalos-e776e27d-8bc1-487d-ae5d-d7ac1f5b32bd");
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { onAuthStateChanged, signInWithPopup, signOut, doc, setDoc, collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, writeBatch };
export type { FirebaseUser };
