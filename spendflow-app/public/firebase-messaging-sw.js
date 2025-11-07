importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCbioszHdBJKCVzel9fy-iXa3k8uB6sS8I",
  authDomain: "chat-76d96.firebaseapp.com",
  projectId: "chat-76d96",
  messagingSenderId: "950285925188",
  appId: "1:950285925188:web:ef7bf698a9571cafc5b511"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title || 'SpendFlow Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new notification',
    icon: '/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
