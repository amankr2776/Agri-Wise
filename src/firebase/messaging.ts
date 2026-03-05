
'use client';

import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { Firestore, doc, updateDoc, arrayUnion } from "firebase/firestore";

/**
 * Requests notification permission and stores the FCM token in Firestore.
 * Note: FCM requires a valid VAPID key from the Firebase Console.
 */
export async function initializeMessaging(messaging: Messaging | null, firestore: Firestore, userId: string) {
  if (!messaging || typeof window === 'undefined') return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // You must replace 'YOUR_PUBLIC_VAPID_KEY' with the key from 
      // Project Settings > Cloud Messaging > Web Configuration
      const token = await getToken(messaging, {
        vapidKey: 'BPr_demo_key_placeholder_for_presentation'
      });

      if (token) {
        const userRef = doc(firestore, "users", userId);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token),
          lastTokenSync: new Date().toISOString()
        });
        return token;
      }
    }
  } catch (error) {
    console.warn("FCM Initialization Blocked: Check browser permissions or VAPID key config.", error);
  }
}

/**
 * Dispatches a notification document to a recipient's sub-collection.
 * This simulates the behavior of a Cloud Function for demo purposes.
 */
export async function dispatchGridNotification(
  firestore: Firestore, 
  recipientId: string, 
  payload: { title: string; message: string; type: 'alert' | 'update' | 'system' }
) {
  const { collection, addDoc } = await import('firebase/firestore');
  const notifRef = collection(firestore, "users", recipientId, "notifications");
  
  await addDoc(notifRef, {
    ...payload,
    isRead: false,
    createdAt: new Date().toISOString()
  });
}
