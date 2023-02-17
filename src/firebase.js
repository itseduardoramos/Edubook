import {initializeApp} from 'firebase/app'
import {getAuth, GoogleAuthProvider} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBJNfS8xYXbuWq1Xib7DSd90KbaZZujtVU",
  authDomain: "edubook-30be0.firebaseapp.com",
  projectId: "edubook-30be0",
  storageBucket: "edubook-30be0.appspot.com",
  messagingSenderId: "231173627517",
  appId: "1:231173627517:web:455a5811b4cc02928a9b14"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

export {db, auth, provider, app, storage};
