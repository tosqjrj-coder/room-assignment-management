import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { DEFAULT_USER_ID, db } from './firebase.js'

const COLLECTION = 'defaultStaffSettings'

export async function getDefaultStaff(userId = DEFAULT_USER_ID) {
  const snap = await getDoc(doc(db, COLLECTION, userId))
  if (!snap.exists()) return []
  return snap.data().staffList || []
}

export async function saveDefaultStaff(staffList, userId = DEFAULT_USER_ID) {
  await setDoc(doc(db, COLLECTION, userId), {
    staffList,
    updatedAt: serverTimestamp(),
  })
}
