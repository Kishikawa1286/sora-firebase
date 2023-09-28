import { initializeApp } from "firebase/app";
import { MODE } from "./env";

const firebaseConfig =
  MODE === "prod"
    ? {
        apiKey: "AIzaSyDdHLW-_ADZL-RzbpDpcRYsoOIZwESRlnM",
        authDomain: "sora-prod-kam.firebaseapp.com",
        projectId: "sora-prod-kam",
        storageBucket: "sora-prod-kam.appspot.com",
        messagingSenderId: "834392061325",
        appId: "1:834392061325:web:e12b23b4625b2078d6b9c4"
      }
    : {
        apiKey: "AIzaSyAGPrMP_skdDTbR9EfdY2gbCS74_8gf82M",
        authDomain: "sora-dev-kam.firebaseapp.com",
        projectId: "sora-dev-kam",
        storageBucket: "sora-dev-kam.appspot.com",
        messagingSenderId: "424089261888",
        appId: "1:424089261888:web:5a2d0e9ca93b31346e0ca5"
      };

export const firebaseApp = initializeApp(firebaseConfig);
