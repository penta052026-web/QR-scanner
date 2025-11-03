// ============================================
// Service Worker for FormQRApp PWA
// ============================================

const CACHE_NAME = 'formqrapp-v1.0.0';
const RUNTIME_CACHE = 'formqrapp-runtime';

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/form.html',
  '/style.css',
  '/script.js',
  '/form-script.js',
  '/manifest.json',
  '/penta logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// ============================================
// Install Event - Cache Static Assets
// ============================================
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('❌ Cache install failed:', error);
      })
  );
});

// ============================================
// Activate Event - Clean Old Caches
// ============================================
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('🗑️ Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// ============================================
// Fetch Event - Serve from Cache, Fallback to Network
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    // Cache external resources (like QR code library)
    if (url.href.includes('cdnjs.cloudflare.com')) {
      event.respondWith(cacheFirst(request));
    }
    return;
  }
  
  // Don't cache Google Sheets API calls
  if (url.href.includes('script.google.com') || url.href.includes('drive.google.com')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Use cache-first strategy for static assets
  event.respondWith(cacheFirst(request));
});

// ============================================
// Cache-First Strategy
// ============================================
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('📦 Serving from cache:', request.url);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const runtimeCache = await caches.open(RUNTIME_CACHE);
      runtimeCache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('❌ Fetch failed:', error);
    
    // Return offline page if available
    if (request.destination === 'document') {
      return caches.match('/offline.html') || createOfflineResponse();
    }
    
    throw error;
  }
}

// ============================================
// Create Offline Response
// ============================================
function createOfflineResponse() {
  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - FormQRApp</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #EBF5FF 0%, #FFFFFF 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
        }
        .offline-container {
          background: white;
          padding: 50px 40px;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          max-width: 500px;
        }
        .offline-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 28px;
          color: #1F2937;
          margin-bottom: 15px;
        }
        p {
          font-size: 16px;
          color: #6B7280;
          line-height: 1.6;
          margin-bottom: 25px;
        }
        .btn-retry {
          display: inline-block;
          background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
          color: white;
          padding: 14px 32px;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1>You're Offline</h1>
        <p>Please connect to the internet to access FormQRApp. The app requires an active connection to submit forms and download documents.</p>
        <button class="btn-retry" onclick="window.location.reload()">
          Retry
        </button>
      </div>
    </body>
    </html>
    `,
    {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'text/html' }
    }
  );
}

// ============================================
// Background Sync (for future offline form submissions)
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

async function syncForms() {
  // This would sync any queued form submissions
  // when the device comes back online
  console.log('🔄 Syncing offline form submissions...');
  // Implementation would go here
}

// ============================================
// Push Notifications (optional)
// ============================================
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/penta logo.png',
    badge: '/penta logo.png',
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification('FormQRApp', options)
  );
});

// ============================================
// Log Service Worker Status
// ============================================
console.log('📱 FormQRApp Service Worker loaded');
console.log('Cache Name:', CACHE_NAME);
