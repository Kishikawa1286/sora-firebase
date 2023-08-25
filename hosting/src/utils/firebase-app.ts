import { initializeApp } from "firebase/app";

// TODO: Branch dev and prod
const firebaseConfig = {
  apiKey: "AIzaSyAGPrMP_skdDTbR9EfdY2gbCS74_8gf82M",
  authDomain: "sora-dev-kam.firebaseapp.com",
  projectId: "sora-dev-kam",
  storageBucket: "sora-dev-kam.appspot.com",
  messagingSenderId: "424089261888",
  appId: "1:424089261888:web:5a2d0e9ca93b31346e0ca5"
};

export const firebaseApp = initializeApp(firebaseConfig);
