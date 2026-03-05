
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDHxfYxpNDXYQrkD83Qi52Rk_5i3usDeFE",
  authDomain: "studio-1454277402-fdd5e.firebaseapp.com",
  projectId: "studio-1454277402-fdd5e",
  storageBucket: "studio-1454277402-fdd5e.appspot.com",
  messagingSenderId: "1032103309589",
  appId: "1:1032103309589:web:dbfa3d2dc4d17c94c8b91c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
