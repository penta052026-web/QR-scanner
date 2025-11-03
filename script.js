// ============================================
// QR Code Generation Script
// ============================================

// Configuration
const QR_CONFIG = {
    // Local network URL for mobile testing
    // Make sure your phone is on the same WiFi network
    formUrl: 'http://192.168.1.25:8000/form.html',
    // After deploying to GitHub Pages, update with:
    // formUrl: 'https://YOUR-USERNAME.github.io/FormQRApp/form.html',
    qrCodeSize: 280,
    qrCodeColorDark: '#1F2937',
    qrCodeColorLight: '#FFFFFF',
    qrCodeCorrectLevel: QRCode.CorrectLevel.H
};

// ============================================
// Initialize on Page Load
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 FormQRApp initialized');
    generateQRCode();
    setupClickHandlers();
    checkOnlineStatus();
});

// ============================================
// Generate QR Code
// ============================================
function generateQRCode() {
    const qrcodeElement = document.getElementById('qrcode');
    
    if (!qrcodeElement) {
        console.error('❌ QR code element not found');
        return;
    }
    
    try {
        // Clear any existing content
        qrcodeElement.innerHTML = '';
        
        // Generate QR code
        new QRCode(qrcodeElement, {
            text: QR_CONFIG.formUrl,
            width: QR_CONFIG.qrCodeSize,
            height: QR_CONFIG.qrCodeSize,
            colorDark: QR_CONFIG.qrCodeColorDark,
            colorLight: QR_CONFIG.qrCodeColorLight,
            correctLevel: QR_CONFIG.qrCodeCorrectLevel
        });
        
        console.log('✅ QR Code generated successfully');
        console.log('📍 Form URL:', QR_CONFIG.formUrl);
    } catch (error) {
        console.error('❌ Error generating QR code:', error);
        qrcodeElement.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <p style="color:#EF4444;">Error generating QR code</p>
                <p style="color:#6B7280; font-size:14px; margin-top:10px;">Please refresh the page</p>
            </div>
        `;
    }
}

// ============================================
// Setup Click Handlers
// ============================================
function setupClickHandlers() {
    // Logo animation on click
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            this.style.transform = 'scale(1.15) rotate(5deg)';
            setTimeout(() => {
                this.style.transform = '';
            }, 400);
        });
    }
    
    // QR code click to open form (desktop fallback)
    const qrcode = document.getElementById('qrcode');
    if (qrcode) {
        qrcode.addEventListener('click', function() {
            window.location.href = QR_CONFIG.formUrl;
        });
        qrcode.style.cursor = 'pointer';
        qrcode.setAttribute('title', 'Click to open form');
    }
    
    // Scan label click
    const scanLabel = document.querySelector('.scan-label');
    if (scanLabel) {
        scanLabel.addEventListener('click', function() {
            window.location.href = QR_CONFIG.formUrl;
        });
    }
}

// ============================================
// Check Online Status
// ============================================
function checkOnlineStatus() {
    function updateOnlineStatus() {
        if (!navigator.onLine) {
            showOfflineIndicator();
        } else {
            hideOfflineIndicator();
        }
    }
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    updateOnlineStatus();
}

function showOfflineIndicator() {
    let indicator = document.querySelector('.offline-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'offline-indicator';
        indicator.textContent = '⚠️ You are offline. Some features may not work.';
        document.body.insertBefore(indicator, document.body.firstChild);
    }
}

function hideOfflineIndicator() {
    const indicator = document.querySelector('.offline-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// ============================================
// Download QR Code (Optional Feature)
// ============================================
function downloadQRCode() {
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'form-qr-code.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        console.log('✅ QR Code downloaded');
    }
}

// ============================================
// Error Handling
// ============================================
window.addEventListener('error', function(event) {
    console.error('❌ Page error:', event.error);
});

// ============================================
// Log App Info
// ============================================
console.log('%c📱 FormQRApp', 'font-size:20px; font-weight:bold; color:#4A90E2;');
console.log('Version: 1.0.0');
console.log('Form URL:', QR_CONFIG.formUrl);
console.log('PWA: Service Worker', 'serviceWorker' in navigator ? '✅' : '❌');
