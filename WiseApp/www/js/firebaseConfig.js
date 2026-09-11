import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCwG0LUL7Zn4ddVfk3lFbKgbgXll9Pj84A",
    authDomain: "wise-dff0e.firebaseapp.com",
    projectId: "wise-dff0e",
    storageBucket: "wise-dff0e.firebasestorage.app",
    messagingSenderId: "888070286189",
    appId: "1:888070286189:web:d1ba17914ffd76c4370864",
    measurementId: "G-8WR27Q4REB"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);     
