self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Neuer Termin verfügbar', {
      body: data.body || 'Ein neuer Tag wurde freigeschaltet.',
      icon: '/icon.png',
      badge: '/icon.png',
    })
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(clients.openWindow('/book'))
})
