import { calculateEstimatedCalories, calculateEstimatedDistanceKm } from '../config/economy';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export class PedometerService {
  private static instance: PedometerService;
  private isListening = false;
  private lastStepTimestamp = 0;

  static getInstance(): PedometerService {
    if (!PedometerService.instance) {
      PedometerService.instance = new PedometerService();
    }
    return PedometerService.instance;
  }

  // Request native/browser device motion sensor
  async requestMotionPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // iOS 13+ DeviceMotionEvent permission
      if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof (DeviceMotionEvent as any).requestPermission === 'function'
      ) {
        const response = await (DeviceMotionEvent as any).requestPermission();
        return response === 'granted';
      }
      return true;
    } catch (err) {
      console.warn('Device motion permission note:', err);
      return true;
    }
  }

  // Listen to physical motion on phone
  startTracking(onStepDetected: () => void): () => void {
    if (typeof window === 'undefined' || this.isListening) return () => {};

    let lastAccel = { x: 0, y: 0, z: 0 };
    const threshold = 12.5;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const deltaX = Math.abs(acc.x - lastAccel.x);
      const deltaY = Math.abs(acc.y - lastAccel.y);
      const deltaZ = Math.abs(acc.z - lastAccel.z);
      const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

      const now = Date.now();
      // Debounce steps ~250ms minimum per human stride
      if (magnitude > threshold && now - this.lastStepTimestamp > 280) {
        this.lastStepTimestamp = now;
        onStepDetected();
      }

      lastAccel = { x: acc.x, y: acc.y, z: acc.z };
    };

    window.addEventListener('devicemotion', handleMotion);
    this.isListening = true;

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      this.isListening = false;
    };
  }

  // Sync to Firestore
  async saveStepsToFirestore(uid: string, date: string, steps: number, claimedMilestones: number[]): Promise<void> {
    try {
      const docRef = doc(db, 'stepRecords', uid, 'days', date);
      const docSnap = await getDoc(docRef);

      const distanceKm = calculateEstimatedDistanceKm(steps);
      const caloriesBurned = calculateEstimatedCalories(steps);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          steps,
          distanceKm,
          caloriesBurned,
          claimedMilestones,
          source: 'healthkit',
        });
      } else {
        await updateDoc(docRef, {
          steps,
          distanceKm,
          caloriesBurned,
        });
      }
    } catch (err) {
      console.warn('Firestore step record sync note:', err);
    }
  }
}
