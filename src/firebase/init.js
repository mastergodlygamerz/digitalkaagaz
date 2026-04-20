// Centralized Firebase initializer — sets `window._firebase` for backward compatibility
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, limit, doc, setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const cfg = {
  apiKey: "AIzaSyBPYVRimtsYSdG5oIuEQpfgGaeV0wQS5QU",
  authDomain: "digitalkaagaz-c8263.firebaseapp.com",
  projectId: "digitalkaagaz-c8263",
  storageBucket: "digitalkaagaz-c8263.firebasestorage.app",
  messagingSenderId: "18588901735",
  appId: "1:18588901735:web:dfdafad03fc875ed890fc2"
};

const app = getApps().length ? getApps()[0] : initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);

window._firebase = window._firebase || {};
Object.assign(window._firebase, {
  app,
  auth,
  db,
  // auth helpers
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  // firestore helpers
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  doc,
  setDoc
});

export default window._firebase;
