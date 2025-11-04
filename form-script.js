// ============================================
// Form Submission Handler
// ============================================

// Configuration
const FORM_CONFIG = {
    // Google Apps Script Web App URL - UPDATED
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbx7FzBhA5DtqOS-kWbrjgXjEOBR-rVh4v4J5Dd7oM3BHovm4ZvMLRB61nmuYHm-7fTYsw/exec',
    
    // PDF Download URLs
    pdfUrls: [
        {
            url: 'https://drive.google.com/uc?export=download&id=13kpFhw8HOVzAv5DdWHqOMQVeaiJLdv1C',
            filename: 'PENTA-LaboCatalogue.pdf'
        },
        {
            url: 'https://drive.google.com/uc?export=download&id=1_zutQh_MSIdv7N5k7n1Suw4HhRXpgyvr',
            filename: 'EDUC-CAT.pdf'
        }
    ],
    
    // Success message display duration
    successDuration: 3000
};

// ============================================
// Initialize Form
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Form initialized');
    
    const form = document.getElementById('feedbackForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        setupRealtimeValidation();
    }
    
    checkOnlineStatus();
});

// ============================================
// Handle Form Submission
// ============================================
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Get form data
    const formData = getFormData();
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Step 1: Submit to Google Sheets
        console.log('📊 Submitting to Google Sheets...');
        await submitToGoogleSheets(formData);
        console.log('✅ Data saved to Google Sheets');
        
        // Step 2: Download PDFs
        console.log('📥 Initiating PDF downloads...');
        downloadPDFs();
        console.log('✅ PDF downloads started');
        
        // Step 3: Show success message
        showSuccessMessage();
        
        // Reset form after delay
        setTimeout(() => {
            document.getElementById('feedbackForm').reset();
        }, FORM_CONFIG.successDuration);
        
    } catch (error) {
        console.error('❌ Form submission error:', error);
        alert('❌ Unable to submit form. Please check your internet connection and try again.');
    } finally {
        setLoadingState(false);
    }
}

// ============================================
// Submit to Google Sheets
// ============================================
async function submitToGoogleSheets(formData) {
    console.log('📤 Sending data to Google Sheets...');
    console.log('🔗 URL:', FORM_CONFIG.googleScriptUrl);
    console.log('📋 Data:', formData);
    
    try {
        // Actual submission to Google Sheets
        const response = await fetch(FORM_CONFIG.googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('✅ Request sent successfully');
        console.log('⚠️ Note: no-cors mode - check Google Sheets to verify data');
        
        // Note: no-cors mode doesn't allow reading response
        // Check Google Apps Script Executions log to verify
        return response;
    } catch (error) {
        console.error('❌ Fetch error:', error);
        throw error;
    }
}

// ============================================
// Download PDFs
// ============================================
function downloadPDFs() {
    console.log('📥 Starting immediate PDF downloads...');
    
    // Show download status
    updateDownloadStatus('📥 Downloading both PDFs now...');
    
    try {
        // Download all PDFs immediately without delay
        FORM_CONFIG.pdfUrls.forEach((pdf, index) => {
            console.log(`🚀 Downloading ${index + 1}/${FORM_CONFIG.pdfUrls.length}: ${pdf.filename}`);
            downloadSinglePDF(pdf.url, pdf.filename);
        });
        
        // Update status after all downloads initiated
        setTimeout(() => {
            updateDownloadStatus('✅ Both PDFs are downloading! Check your downloads folder or browser tabs.');
        }, 1000);
        
        console.log(`✅ ${FORM_CONFIG.pdfUrls.length} PDF downloads initiated simultaneously`);
    } catch (error) {
        console.error('❌ PDF downloads error:', error);
        updateDownloadStatus('⚠️ Download failed. Please use manual download buttons below.');
    }
}

function downloadSinglePDF(url, filename) {
    try {
        console.log(`📥 Opening download: ${filename}`);
        
        // Use window.open for better cross-browser and mobile support
        // This works better with Google Drive links on all devices
        const downloadWindow = window.open(url, '_blank');
        
        if (downloadWindow) {
            console.log(`✅ Download window opened: ${filename}`);
            
            // For mobile devices, focus the new window
            if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                downloadWindow.focus();
            }
            
            return true;
        } else {
            console.warn(`⚠️ Popup blocked for: ${filename}`);
            // Try alternative method if popup is blocked
            location.href = url;
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Download failed for ${filename}:`, error);
        // Final fallback: direct navigation
        location.href = url;
        return false;
    }
}

// ============================================
// Download Status and Manual Download Helpers
// ============================================
function updateDownloadStatus(message) {
    const statusElement = document.getElementById('downloadStatus');
    if (statusElement) {
        statusElement.querySelector('p').textContent = message;
    }
}

function showManualDownloadOptions(successfulDownloads) {
    const manualDownloads = document.getElementById('manualDownloads');
    const downloadStatus = document.getElementById('downloadStatus');
    
    if (successfulDownloads === FORM_CONFIG.pdfUrls.length) {
        updateDownloadStatus('✅ PDFs downloaded successfully!');
        // Still show manual options in case user needs them
        setTimeout(() => {
            if (manualDownloads) {
                manualDownloads.style.display = 'block';
            }
        }, 2000);
    } else {
        updateDownloadStatus('⚠️ Some downloads may have failed. Use the buttons below:');
        if (manualDownloads) {
            manualDownloads.style.display = 'block';
        }
    }
}

// ============================================
// Form Validation
// ============================================
function validateForm() {
    let isValid = true;
    
    // Validate name
    const name = document.getElementById('name').value.trim();
    if (name.length < 2) {
        showError('name', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    // Validate company
    const company = document.getElementById('company').value.trim();
    if (company.length < 2) {
        showError('company', 'Company name must be at least 2 characters');
        isValid = false;
    }
    
    // Validate email
    const email = document.getElementById('email').value.trim();
    if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// Get Form Data
// ============================================
function getFormData() {
    return {
        name: document.getElementById('name').value.trim(),
        company: document.getElementById('company').value.trim(),
        email: document.getElementById('email').value.trim(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };
}

// ============================================
// Real-time Validation
// ============================================
function setupRealtimeValidation() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearFieldError(this.id);
        });
        
        input.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                validateField(this.id);
            }
        });
    });
}

function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();
    
    let isValid = true;
    let errorMessage = '';
    
    switch(fieldId) {
        case 'name':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters';
            }
            break;
            
        case 'company':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Company name must be at least 2 characters';
            }
            break;
            
        case 'email':
            if (!isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
    }
    
    if (!isValid) {
        showError(fieldId, errorMessage);
    }
    
    return isValid;
}

// ============================================
// Error Handling
// ============================================
function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    
    if (input) input.classList.add('error');
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.classList.add('show');
    }
}

function clearFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    
    if (input) input.classList.remove('error');
    if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.classList.remove('show');
    }
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    const inputs = document.querySelectorAll('.form-input');
    
    errorMessages.forEach(msg => {
        msg.textContent = '';
        msg.classList.remove('show');
    });
    inputs.forEach(input => input.classList.remove('error'));
}

// ============================================
// Show Success Message
// ============================================
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    const form = document.getElementById('feedbackForm');
    
    if (successMessage && form) {
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update download status after a short delay
        setTimeout(() => {
            updateDownloadStatus('✅ PDFs should be downloading. Use buttons below if needed:');
        }, 3000);
        
        // Don't auto-hide - let user stay on thank you page
        // They can use the "Back to QR Code" link if needed
    }
}

// ============================================
// Loading State
// ============================================
function setLoadingState(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    if (isLoading) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'flex';
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'flex';
        if (btnLoader) btnLoader.style.display = 'none';
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
        indicator.textContent = '⚠️ You are offline. Please connect to submit the form.';
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
// Prevent Double Submission
// ============================================
let isSubmitting = false;

document.addEventListener('submit', function(e) {
    if (isSubmitting) {
        e.preventDefault();
        return false;
    }
});

// ============================================
// Log Configuration
// ============================================
console.log('%c📝 Form Script Loaded', 'font-size:16px; font-weight:bold; color:#4A90E2;');
console.log('Google Script URL:', FORM_CONFIG.googleScriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' ? '⚠️ Not configured' : '✅ Configured');
console.log('PDF URLs:', FORM_CONFIG.pdfUrls.map(pdf => `${pdf.filename}: ${pdf.url}`));
