import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, setDoc, getDoc, getDocs, onSnapshot, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ВСТАВЬ СВОЙ firebaseConfig из console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyBTFlu-JMdXx2oICi4dDANWdMtWJW8zNJ8",
  authDomain: "home-cooking52.firebaseapp.com",
  projectId: "home-cooking52",
  storageBucket: "home-cooking52.firebasestorage.app",
  messagingSenderId: "635298788932",
  appId: "1:635298788932:web:62d03ae8c22c70a5756e11",
  measurementId: "G-FS1W2B7C23"
};

let db = null;
let ready = false;
try {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  ready = true;
  console.log("Firebase OK");
} catch(e) { console.warn("Firebase error:", e.message); }

export const isReady = () => ready;

// --- ЗАКАЗЫ ---
export async function saveOrder(data) {
  if (!ready) throw new Error("Firebase не настроен");
  return await addDoc(collection(db, "orders"), { ...data, status: "new", createdAt: serverTimestamp() });
}
export function listenOrders(cb) {
  if (!ready) return;
  return onSnapshot(collection(db, "orders"), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
export async function deleteOrder(id) {
  if (!ready) return;
  await deleteDoc(doc(db, "orders", id));
}

// --- БРОНИРОВАНИЯ ---
export async function saveBooking(data) {
  if (!ready) throw new Error("Firebase не настроен");
  return await addDoc(collection(db, "bookings"), { ...data, status: "new", createdAt: serverTimestamp() });
}
export function listenBookings(cb) {
  if (!ready) return;
  return onSnapshot(collection(db, "bookings"), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
export async function deleteBooking(id) {
  if (!ready) return;
  await deleteDoc(doc(db, "bookings", id));
}

// --- МЕНЮ ---
export async function saveMenu(menuData) {
  if (!ready) return;
  await setDoc(doc(db, "settings", "menu"), { items: menuData, updatedAt: serverTimestamp() });
}
export async function loadMenu() {
  if (!ready) return null;
  try {
    const snap = await getDoc(doc(db, "settings", "menu"));
    return snap.exists() ? snap.data().items : null;
  } catch(e) { return null; }
}
export function listenMenu(cb) {
  if (!ready) return;
  return onSnapshot(doc(db, "settings", "menu"), snap => {
    if (snap.exists()) cb(snap.data().items);
  });
}

// --- ПАРОЛЬ В БД ---
export async function savePassword(hash) {
  if (!ready) return;
  await setDoc(doc(db, "settings", "admin"), { passwordHash: hash, updatedAt: serverTimestamp() });
}
export async function loadPassword() {
  if (!ready) return null;
  try {
    const snap = await getDoc(doc(db, "settings", "admin"));
    return snap.exists() ? snap.data().passwordHash : null;
  } catch(e) { return null; }
}

// --- ЗАГРУЗКА ФОТО (ImgBB) ---
const IMGBB_KEY = '7211b469b211fbe8eddf7285042eb17d';
export async function uploadPhoto(file) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_KEY, { method: 'POST', body: fd });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Ошибка загрузки');
  return json.data.url;
}
