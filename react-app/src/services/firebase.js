import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAVBXWxVEa_DZvdtrJ1igfUO7md2ne2UJ0',
  authDomain: 'task-assignment-8dcee.firebaseapp.com',
  projectId: 'task-assignment-8dcee',
  storageBucket: 'task-assignment-8dcee.firebasestorage.app',
  messagingSenderId: '589104724932',
  appId: '1:589104724932:web:df794504587f2dc8555b13',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const DEFAULT_USER_ID = 'default'
