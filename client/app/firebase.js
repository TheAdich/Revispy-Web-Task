
import { initializeApp } from "firebase/app";
import { getAnalytics,isSupported } from "firebase/analytics";
import { getStorage } from 'firebase/storage';
import { useEffect } from 'react';
const firebaseConfig = {
  apiKey: "AIzaSyCQjhBhobpXJjZUCmgNz37qeI2gqxrhkZs",
  authDomain: "revispy-task.firebaseapp.com",
  projectId: "revispy-task",
  storageBucket: "revispy-task.appspot.com",
  messagingSenderId: "389946937829",
  appId: "1:389946937829:web:6eeafc70957e4cc59f9f0c",
  measurementId: "G-TC885NN7PG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);