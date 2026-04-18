// GolfIt Service Worker - Web Push Notifications
const CACHE_VERSION = 'golfit-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: 'GolfIt', body: event.data.text() };
  }

  const title = payload.title || 'GolfIt';
  const options = {
    body: payload.body || '',
    icon: '/lovable-uploads/b6585f6c-4c9f-4a38-8e96-cd5c6457a497.png',
    badge: '/lovable-uploads/b6585f6c-4c9f-4a38-8e96-cd5c6457a497.png',
    data: payload.data || {},
    vibrate: [100, 50, 100],
    tag: payload.data?.type || 'golfit-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
