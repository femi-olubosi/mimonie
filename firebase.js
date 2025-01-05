// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCthu5yJiNMm1KzESfvXetclVtb5eTSjzA',
  authDomain: 'mimonie-69c72.firebaseapp.com',
  projectId: 'mimonie-69c72',
  storageBucket: 'mimonie-69c72.appspot.com',
  messagingSenderId: '115769961743',
  appId: '1:115769961743:web:1e06c34b756c581ab6a27a',
  measurementId: 'G-QSD5CSZ5FR',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app, auth };
