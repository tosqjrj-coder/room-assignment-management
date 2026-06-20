import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase.js'

const COLLECTION = 'dailySchedules'

export async function getDailySchedule(dateKey) {
  const snap = await getDoc(doc(db, COLLECTION, dateKey))
  if (!snap.exists()) return null
  return snap.data()
}

export async function saveDailySchedule(schedule) {
  await setDoc(doc(db, COLLECTION, schedule.date), {
    ...schedule,
    updatedAt: serverTimestamp(),
  })
}
