import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC7Alf54oGnSS8cnKAfLKCH4e6aUvrPfP0",
  authDomain: "nico-react-witter.firebaseapp.com",
  projectId: "nico-react-witter",
  storageBucket: "nico-react-witter.appspot.com",
  messagingSenderId: "928755359615",
  appId: "1:928755359615:web:9f3e104bf474f7816c844a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)

export const storeage = getStorage(app)

export const db = getFirestore(app)

