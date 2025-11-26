/* ============================================
   INLINE SCRIPTS
   Waitlist System & Email System (Bug Reports + Contact)
   Extracted from index.html
   ============================================ */

// ============================================
// GAME VERSION (Single Source of Truth)
// ============================================

// Get game version from footer badge
function getGameVersion() {
    const badge = document.getElementById('gameVersionBadge');
    return badge ? badge.textContent.trim() : 'v1.4.3';
}

// ============================================
// MOBILE DETECTION & WAITLIST SYSTEM
// ============================================

// Detect if device is mobile
function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobile = mobileRegex.test(userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    return isMobile || isSmallScreen;
}

// Check if user dismissed mobile warning
function hasDismissedMobileWarning() {
    const dismissed = localStorage.getItem('dismissedMobileWarning');
    if (!dismissed) return false;
    
    // Check if dismissed more than 7 days ago
    const dismissedTime = parseInt(dismissed);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return dismissedTime > sevenDaysAgo;
}

// Show mobile waitlist modal
function showMobileWaitlist() {
    const isMobile = isMobileDevice();
    const hasDismissed = hasDismissedMobileWarning();
    
    
    if (isMobile && !hasDismissed) {
        const modal = document.getElementById('mobileWaitlistModal');
        if (modal) {
            modal.classList.add('active');
            // Prevent scrolling on body
            document.body.style.overflow = 'hidden';
        } else {
            console.error('[WAITLIST] ERROR: Modal element not found!');
        }
    } else {
    }
}

// Dismiss mobile warning
function dismissMobileWarning() {
    localStorage.setItem('dismissedMobileWarning', Date.now().toString());
    document.getElementById('mobileWaitlistModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Join waitlist function
window.joinWaitlist = function() {
    const emailInput = document.getElementById('waitlistEmail');
    const privacyCheckbox = document.getElementById('waitlistPrivacy');
    const marketingCheckbox = document.getElementById('waitlistMarketing');
    const validationDiv = document.getElementById('waitlistValidation');
    const successDiv = document.getElementById('waitlistSuccess');
    const submitBtn = event.target;
    
    // Clear previous validation
    validationDiv.style.display = 'none';
    
    // Get values
    const email = emailInput.value.trim();
    
    // Validate email
    if (!email) {
        validationDiv.textContent = 'Please enter your email address.';
        validationDiv.style.display = 'block';
        emailInput.focus();
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        validationDiv.textContent = 'Please enter a valid email address.';
        validationDiv.style.display = 'block';
        emailInput.focus();
        return;
    }
    
    // Validate checkboxes
    if (!privacyCheckbox.checked) {
        validationDiv.textContent = 'You must accept the Privacy Policy to continue.';
        validationDiv.style.display = 'block';
        return;
    }
    
    if (!marketingCheckbox.checked) {
        validationDiv.textContent = 'You must accept to receive updates to join the waitlist.';
        validationDiv.style.display = 'block';
        return;
    }
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Joining...';
    
    // Prepare EmailJS params
    const params = {
        from_name: 'Mobile Waitlist',
        reply_to: email,
        user_email: email,
        signup_date: new Date().toLocaleString(),
        privacy_accepted: 'Yes',
        marketing_accepted: 'Yes',
        device_info: navigator.userAgent,
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
        message: `New mobile waitlist signup from ${email}`
    };
    
    
    // Send via EmailJS (using waitlist template)
    if (window.emailjs) {
        emailjs.send('service_tfl51qs', 'template_hif1mc1', params)
            .then(function(response) {
                
                // Show success message
                successDiv.style.display = 'block';
                emailInput.value = '';
                privacyCheckbox.checked = false;
                marketingCheckbox.checked = false;
                
                // Store in localStorage to prevent duplicate signups
                localStorage.setItem('waitlistSignup', email);
                
                // Auto-dismiss after 3 seconds
                setTimeout(() => {
                    dismissMobileWarning();
                }, 3000);
                
            }, function(error) {
                console.error('Waitlist signup FAILED:', error);
                validationDiv.textContent = 'Failed to join waitlist. Please try again.';
                validationDiv.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = '✨ Join Waitlist';
            });
    } else {
        console.error('EmailJS not loaded');
        validationDiv.textContent = 'Email service not available. Please try again later.';
        validationDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = '✨ Join Waitlist';
    }
};

// Show modal on page load if mobile
window.addEventListener('DOMContentLoaded', function() {
    showMobileWaitlist();
});

// ============================================
// BUG REPORT SYSTEM
// ============================================

// Anti-bot protection storage
let bugReportAttempts = JSON.parse(localStorage.getItem('bugReportAttempts') || '[]');
let lastBugReportTime = parseInt(localStorage.getItem('lastBugReportTime') || '0');
let currentMathAnswer = 0;

// Show human verification when needed
function showHumanVerification() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    currentMathAnswer = num1 + num2;
    
    document.getElementById('mathQuestion').textContent = `${num1} + ${num2} = ?`;
    document.getElementById('mathAnswer').value = '';
    document.getElementById('humanVerification').style.display = 'block';
    
    // Focus on answer input
    setTimeout(() => {
        document.getElementById('mathAnswer').focus();
    }, 100);
}

// Hide human verification
function hideHumanVerification() {
    document.getElementById('humanVerification').style.display = 'none';
    // Also clear validation messages
    const validationDiv = document.getElementById('validationMessage');
    if (validationDiv) validationDiv.style.display = 'none';
    
    // Reset email field
    document.getElementById('sendCopyCheckbox').checked = false;
    document.getElementById('userEmail').style.display = 'none';
    document.getElementById('emailValidation').style.display = 'none';
}

// Toggle email field visibility
function toggleEmailField() {
    const checkbox = document.getElementById('sendCopyCheckbox');
    const emailField = document.getElementById('userEmail');
    const emailValidation = document.getElementById('emailValidation');
    
    if (checkbox.checked) {
        emailField.style.display = 'block';
        setTimeout(() => emailField.focus(), 100);
    } else {
        emailField.style.display = 'none';
        emailField.value = '';
        emailValidation.style.display = 'none';
        emailField.style.borderColor = 'rgba(201,169,97,0.3)';
    }
}

// Validate email format
function validateEmail() {
    const emailField = document.getElementById('userEmail');
    const emailValidation = document.getElementById('emailValidation');
    const email = emailField.value.trim();
    
    if (!email) {
        emailValidation.style.display = 'none';
        emailField.style.borderColor = 'rgba(201,169,97,0.3)';
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
        emailValidation.style.display = 'none';
        emailField.style.borderColor = '#6bcf7f';
    } else {
        emailValidation.textContent = 'Please enter a valid email address';
        emailValidation.style.display = 'block';
        emailField.style.borderColor = '#ff6b6b';
    }
}

// Update character count and validation
function updateCharacterCount() {
    const textarea = document.getElementById('bugMessage');
    const countDiv = document.getElementById('characterCount');
    const validationDiv = document.getElementById('validationMessage');
    
    const length = textarea.value.length;
    countDiv.textContent = `${length} / 2000`;
    
    // Visual feedback for character count
    if (length > 2000) {
        countDiv.style.color = '#ff6b6b';
        textarea.style.borderColor = '#ff6b6b';
        validationDiv.textContent = 'Message too long (max 2000 characters)';
        validationDiv.style.display = 'block';
    } else if (length < 10 && length > 0) {
        countDiv.style.color = '#ffd700';
        textarea.style.borderColor = '#ffd700';
        validationDiv.textContent = 'Please provide more details (min 10 characters)';
        validationDiv.style.display = 'block';
    } else if (length >= 10) {
        countDiv.style.color = '#6bcf7f';
        textarea.style.borderColor = 'rgba(201,169,97,0.3)';
        validationDiv.style.display = 'none';
    } else {
        countDiv.style.color = '#aaa';
        textarea.style.borderColor = 'rgba(201,169,97,0.3)';
        validationDiv.style.display = 'none';
    }
}

// Show rate limit message inline
function showRateLimitMessage(message) {
    const validationDiv = document.getElementById('validationMessage');
    validationDiv.textContent = message;
    validationDiv.style.color = '#ffd700';
    validationDiv.style.display = 'block';
}

// Enhanced browser detection
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let os = 'Unknown';
    
    // Browser detection
    if (ua.includes('Firefox/')) {
        browserName = 'Firefox';
        browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
        browserName = 'Chrome';
        browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Edg/')) {
        browserName = 'Edge';
        browserVersion = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
        browserName = 'Safari';
        browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
        browserName = 'Opera';
        browserVersion = ua.match(/(?:Opera|OPR)\/(\d+)/)?.[1] || 'Unknown';
    }
    
    // OS detection
    if (ua.includes('Windows')) {
        os = 'Windows';
        if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
        else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
    } else if (ua.includes('Mac OS')) {
        os = 'macOS';
        const macVersion = ua.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, '.');
        if (macVersion) os = `macOS ${macVersion}`;
    } else if (ua.includes('Linux')) {
        os = 'Linux';
    } else if (ua.includes('Android')) {
        os = 'Android';
        const androidVersion = ua.match(/Android (\d+)/)?.[1];
        if (androidVersion) os = `Android ${androidVersion}`;
    } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
        os = 'iOS';
        const iosVersion = ua.match(/OS (\d+_\d+)/)?.[1]?.replace(/_/g, '.');
        if (iosVersion) os = `iOS ${iosVersion}`;
    }
    
    return {
        name: browserName,
        version: browserVersion,
        os: os,
        full: `${browserName} ${browserVersion} on ${os}`
    };
}

// Enhanced screen detection
function getScreenInfo() {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Device type detection
    let deviceType = 'Desktop';
    if (window.innerWidth <= 768) {
        deviceType = 'Mobile';
    } else if (window.innerWidth <= 1024) {
        deviceType = 'Tablet';
    }
    
    return {
        resolution: `${screenWidth}x${screenHeight}`,
        viewport: `${viewportWidth}x${viewportHeight}`,
        device: deviceType,
        pixelRatio: pixelRatio,
        screenWidth: screenWidth,
        screenHeight: screenHeight,
        viewportWidth: viewportWidth,
        viewportHeight: viewportHeight
    };
}

// Bug Report Function (Global Scope)
window.sendBugReport = function() {
    try {
        const now = Date.now();
        
        // RATE LIMITING: Max 1 report per 5 minutes
        if (now - lastBugReportTime < 5 * 60 * 1000) {
            const remainingTime = Math.ceil((5 * 60 * 1000 - (now - lastBugReportTime)) / 1000 / 60);
            showRateLimitMessage(`Please wait ${remainingTime} minutes before sending another bug report.`);
            return;
        }
        
        // DAILY LIMIT: Max 3 reports per day
        const today = new Date().toDateString();
        const todayAttempts = bugReportAttempts.filter(attempt => 
            new Date(attempt).toDateString() === today
        ).length;
        
        if (todayAttempts >= 3) {
            showRateLimitMessage('Daily limit reached. You can send up to 3 bug reports per day.');
            return;
        }
        
        // Check if human verification is needed
        const verificationDiv = document.getElementById('humanVerification');
        if (verificationDiv.style.display === 'none' || !verificationDiv.style.display) {
            // First click - show verification
            showHumanVerification();
            return;
        }
        
        // HUMAN VERIFICATION: Check answer
        const userAnswer = parseInt(document.getElementById('mathAnswer').value);
        if (!userAnswer || userAnswer !== currentMathAnswer) {
            // Shake the input field for visual feedback
            const answerInput = document.getElementById('mathAnswer');
            answerInput.style.animation = 'shake 0.5s';
            answerInput.style.borderColor = '#ff6b6b';
            setTimeout(() => {
                answerInput.style.animation = '';
                answerInput.style.borderColor = 'rgba(201,169,97,0.3)';
            }, 500);
            return;
        }
        const textarea = document.getElementById('bugMessage');
        if (!textarea) { 
            console.error('bugMessage textarea not found');
            showRateLimitMessage('Bug report system unavailable. Please try again later.');
            return; 
        }
        const message = (textarea.value || '').trim();
        
        // Simple anti-spam validation (visual feedback already handled by updateCharacterCount)
        if (!message) { 
            showRateLimitMessage('Please describe the bug.');
            textarea.focus();
            return; 
        }
        if (message.length < 10) {
            showRateLimitMessage('Please provide more details (at least 10 characters).');
            textarea.focus();
            return;
        }
        if (message.length > 2000) {
            showRateLimitMessage('Message too long. Please keep it under 2000 characters.');
            textarea.focus();
            return;
        }
        
        // Simple spam detection
        const spamWords = ['viagra', 'casino', 'lottery', 'winner', 'click here', 'free money'];
        const lowerMessage = message.toLowerCase();
        if (spamWords.some(word => lowerMessage.includes(word))) {
            showRateLimitMessage('Message contains inappropriate content.');
            textarea.focus();
            return;
        }
        
        if (!window.emailjs) { 
            showRateLimitMessage('Email service not loaded. Please refresh the page and try again.');
            return; 
        }
        
        // Check if user wants email copy and validate
        const sendCopyCheckbox = document.getElementById('sendCopyCheckbox');
        const userEmail = document.getElementById('userEmail');
        let userEmailValue = '';
        
        if (sendCopyCheckbox.checked) {
            userEmailValue = userEmail.value.trim();
            if (!userEmailValue) {
                showRateLimitMessage('Please enter your email address or uncheck "Send me a copy".');
                userEmail.focus();
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userEmailValue)) {
                showRateLimitMessage('Please enter a valid email address.');
                userEmail.focus();
                return;
            }
        }
        
        // Better browser and screen detection
        const browserInfo = getBrowserInfo();
        const screenInfo = getScreenInfo();
        
        const params = {
            // MESSAGE TYPE FLAG
            message_type: 'BUG_REPORT',
            message_type_bug: 'block',
            message_type_contact: 'none',
            message_type_bug_class: 'header-bug',
            message_type_contact_class: '',
            message_border_color: 'rgba(255,107,107,0.1)',
            message_bg_color: 'rgba(255,107,107,0.1)',
            user_email_display: userEmailValue ? 'block' : 'none',
            
            // BASIC INFO
            from_name: 'Player',
            reply_to: userEmailValue || 'hello@dungeonscoundrel.com',
            message: message,
            game_version: getGameVersion(),
            report_date: new Date().toLocaleString(),
            
            // BROWSER INFO
            user_browser: browserInfo.full,
            user_screen: screenInfo.resolution,
            browser: browserInfo.full,
            screen: screenInfo.resolution,
            browser_name: browserInfo.name,
            browser_version: browserInfo.version,
            browser_os: browserInfo.os,
            screen_viewport: screenInfo.viewport,
            screen_device: screenInfo.device,
            screen_pixel_ratio: screenInfo.pixelRatio,
            
            // USER EMAIL
            user_email: userEmailValue,
            send_copy: userEmailValue ? 'Yes' : 'No',
            copy_message: userEmailValue ? '📧 A copy of this report has been sent to your email.' : '',
            
            // LEGACY FIELDS
            version: getGameVersion(),
            date: new Date().toLocaleString()
        };
        
        
        emailjs.send('service_tfl51qs', 'template_x3cplm6', params)
            .then(function(response) {
                
                // Update rate limiting data
                lastBugReportTime = now;
                bugReportAttempts.push(now);
                
                // Keep only last 30 days of attempts
                const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
                bugReportAttempts = bugReportAttempts.filter(time => time > thirtyDaysAgo);
                
                // Save to localStorage
                localStorage.setItem('lastBugReportTime', lastBugReportTime.toString());
                localStorage.setItem('bugReportAttempts', JSON.stringify(bugReportAttempts));
                
                // Clean up and close modal
                const modal = document.getElementById('bugReportModal');
                if (modal) modal.classList.remove('active');
                textarea.value = '';
                hideHumanVerification(); // Reset verification for next time
                showBugReportSuccess();
            })
            .catch(function(err) {
                console.error('EmailJS FAILED:', err);
                console.error('Error status:', err.status);
                console.error('Error text:', err.text);
                showBugReportError(err.text || err.status || 'Unknown error');
            });
    } catch (e) {
        console.error('sendBugReport exception:', e);
        showUnexpectedError(e.message);
    }
};

// Elegant feedback for bug report
function showBugReportSuccess() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 450px; border: 3px solid #6bcf7f; animation: modalSlideIn 0.3s ease;">
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4em; margin-bottom: 15px;">✅</div>
                <h2 style="color: #6bcf7f; margin: 0 0 15px 0;">Bug Report Sent!</h2>
                <p style="color: #ddd; font-size: 1.1em; line-height: 1.6; margin: 0 0 20px 0;">
                    Thank you for helping improve Dungeon Scoundrel!<br>
                    Your report has been received.
                </p>
                <button class="close-modal-btn" onclick="this.closest('.modal-overlay').remove();" style="background: linear-gradient(135deg, #6bcf7f, #2fbf71); border: none; color: #102015; font-size: 1.1em; padding: 12px 32px;">
                    Got it!
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 5000);
}

function showBugReportError(errorMsg) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 450px; border: 3px solid #ff6b6b; animation: modalSlideIn 0.3s ease;">
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4em; margin-bottom: 15px;">❌</div>
                <h2 style="color: #ff6b6b; margin: 0 0 15px 0;">Failed to Send</h2>
                <p style="color: #ddd; font-size: 1em; line-height: 1.6; margin: 0 0 10px 0;">
                    Could not send the bug report.
                </p>
                <p style="color: #aaa; font-size: 0.9em; margin: 0 0 20px 0;">
                    Error: ${errorMsg}
                </p>
                <button class="close-modal-btn" onclick="this.closest('.modal-overlay').remove();" style="font-size: 1.1em; padding: 12px 32px;">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Check EmailJS on page load

// ============================================
// CONTACT FORM SYSTEM
// ============================================

// Contact form rate limiting
let lastContactTime = parseInt(localStorage.getItem('lastContactTime') || '0');
let contactAttempts = JSON.parse(localStorage.getItem('contactAttempts') || '[]');

// Contact form anti-bot
let contactMathAnswer = 0;
let contactAttemptCount = 0;

// Show human verification for contact
function showContactHumanVerification() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    contactMathAnswer = num1 + num2;
    
    document.getElementById('contactMathQuestion').textContent = `${num1} + ${num2} = ?`;
    document.getElementById('contactHumanVerification').style.display = 'block';
    document.getElementById('contactMathAnswer').value = '';
}

// Hide human verification for contact
function hideContactHumanVerification() {
    document.getElementById('contactHumanVerification').style.display = 'none';
    document.getElementById('contactMathAnswer').value = '';
    contactAttemptCount = 0;
}

// Update character count for contact message
function updateContactCharacterCount() {
    const textarea = document.getElementById('contactMessage');
    const counter = document.getElementById('contactCharacterCount');
    const validation = document.getElementById('contactValidationMessage');
    
    if (!textarea || !counter) return;
    
    const length = textarea.value.length;
    const maxLength = 2000;
    
    counter.textContent = `${length} / ${maxLength}`;
    
    if (length > maxLength) {
        counter.style.color = '#ff6b6b';
        validation.textContent = 'Message is too long';
        validation.style.display = 'block';
    } else if (length < 10 && length > 0) {
        counter.style.color = '#ffd93d';
        validation.textContent = 'Message is too short (minimum 10 characters)';
        validation.style.display = 'block';
    } else {
        counter.style.color = '#aaa';
        validation.style.display = 'none';
    }
}

// Validate contact form (removed button disabling - validation happens on submit)
function validateContactForm() {
    // Just update character count, validation happens on submit
    updateContactCharacterCount();
}

// Reset contact form
function resetContactForm() {
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactSubject').value = '';
    document.getElementById('contactMessage').value = '';
    document.getElementById('contactCharacterCount').textContent = '0 / 2000';
    document.getElementById('contactValidationMessage').style.display = 'none';
    hideContactHumanVerification();
    
    const submitBtn = document.getElementById('contactSubmit');
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
}

// Send contact message
window.sendContactMessage = function() {
    try {
        const now = Date.now();
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value.trim();
        const validation = document.getElementById('contactValidationMessage');
        
        // Anti-bot protection: Show math verification on first attempt
        const verificationDiv = document.getElementById('contactHumanVerification');
        const isVerificationVisible = verificationDiv.style.display === 'block';
        
        if (!isVerificationVisible) {
            // Show verification on first attempt
            showContactHumanVerification();
            validation.textContent = 'Please complete the human verification below to send your message.';
            validation.style.display = 'block';
            return;
        }
        
        // Validate math answer
        const userAnswer = parseInt(document.getElementById('contactMathAnswer').value);
        if (isNaN(userAnswer) || userAnswer !== contactMathAnswer) {
            validation.textContent = 'Incorrect answer. Please try again.';
            validation.style.display = 'block';
            showContactHumanVerification(); // Generate new question
            return;
        }
        
        // Rate limiting: 5 minutes between messages
        const fiveMinutes = 5 * 60 * 1000;
        if (now - lastContactTime < fiveMinutes) {
            const remainingTime = Math.ceil((fiveMinutes - (now - lastContactTime)) / 60000);
            validation.textContent = `Please wait ${remainingTime} minute(s) before sending another message.`;
            validation.style.display = 'block';
            return;
        }
        
        // Daily limit: 5 messages per day
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        contactAttempts = contactAttempts.filter(time => time > oneDayAgo);
        
        if (contactAttempts.length >= 5) {
            validation.textContent = 'Daily limit reached (5 messages per day). Please try again tomorrow.';
            validation.style.display = 'block';
            return;
        }
        
        // Validate fields
        if (name.length < 2) {
            validation.textContent = 'Please enter your name.';
            validation.style.display = 'block';
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            validation.textContent = 'Please enter a valid email address.';
            validation.style.display = 'block';
            return;
        }
        
        if (!subject) {
            validation.textContent = 'Please select a subject.';
            validation.style.display = 'block';
            return;
        }
        
        if (message.length < 10) {
            validation.textContent = 'Message must be at least 10 characters.';
            validation.style.display = 'block';
            return;
        }
        
        if (message.length > 2000) {
            validation.textContent = 'Message is too long (max 2000 characters).';
            validation.style.display = 'block';
            return;
        }
        
        validation.style.display = 'none';
        
        // Get subject label
        const subjectLabels = {
            'feedback': '💬 Feedback',
            'suggestion': '💡 Feature Suggestion',
            'partnership': '🤝 Partnership',
            'question': '❓ Question',
            'other': '📝 Other'
        };
        
        // Get browser info
        const browserInfo = getBrowserInfo();
        const screenInfo = getScreenInfo();
        
        // Prepare EmailJS params
        const params = {
            // MESSAGE TYPE FLAG
            message_type: 'CONTACT',
            message_type_bug: 'none',
            message_type_contact: 'block',
            message_type_bug_class: '',
            message_type_contact_class: 'header-contact',
            message_border_color: 'rgba(107,207,255,0.1)',
            message_bg_color: 'rgba(107,207,255,0.1)',
            user_email_display: 'none',
            
            // CONTACT INFO
            from_name: name,
            reply_to: email,
            subject: subjectLabels[subject] || subject,
            message: message,
            contact_email: email,
            contact_name: name,
            contact_subject: subject,
            send_date: new Date().toLocaleString(),
            
            // BROWSER INFO
            user_browser: browserInfo.full,
            user_screen: screenInfo.resolution,
            browser: browserInfo.full,
            screen: screenInfo.resolution,
            browser_name: browserInfo.name,
            browser_version: browserInfo.version,
            browser_os: browserInfo.os,
            screen_viewport: screenInfo.viewport,
            screen_device: screenInfo.device,
            screen_pixel_ratio: screenInfo.pixelRatio,
            
            // LEGACY FIELDS
            report_date: new Date().toLocaleString()
        };
        
        
        // Send via EmailJS (using bug report template for now)
        emailjs.send('service_tfl51qs', 'template_x3cplm6', params)
            .then(function(response) {
                
                // Update rate limiting
                lastContactTime = now;
                contactAttempts.push(now);
                localStorage.setItem('lastContactTime', lastContactTime.toString());
                localStorage.setItem('contactAttempts', JSON.stringify(contactAttempts));
                
                // Close modal and reset form
                document.getElementById('contactModal').classList.remove('active');
                resetContactForm();
                showContactSuccess();
            })
            .catch(function(err) {
                console.error('Contact message FAILED:', err);
                showContactError(err.text || err.status || 'Unknown error');
            });
            
    } catch (e) {
        console.error('sendContactMessage exception:', e);
        showUnexpectedError(e.message);
    }
};

// Show success message
function showContactSuccess() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 450px; border: 3px solid #6bcf7f; animation: modalSlideIn 0.3s ease;">
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4em; margin-bottom: 15px;">✅</div>
                <h2 style="color: #6bcf7f; margin: 0 0 15px 0;">Message Sent!</h2>
                <p style="color: #ddd; font-size: 1.1em; line-height: 1.6; margin: 0 0 20px 0;">
                    Thank you for reaching out! I'll get back to you as soon as possible.
                </p>
                <button class="close-modal-btn" onclick="this.closest('.modal-overlay').remove();" style="font-size: 1.1em; padding: 12px 32px;">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Show error message
function showContactError(errorMsg) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 450px; border: 3px solid #ff6b6b; animation: modalSlideIn 0.3s ease;">
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4em; margin-bottom: 15px;">❌</div>
                <h2 style="color: #ff6b6b; margin: 0 0 15px 0;">Failed to Send</h2>
                <p style="color: #ddd; font-size: 1em; line-height: 1.6; margin: 0 0 10px 0;">
                    Could not send your message.
                </p>
                <p style="color: #aaa; font-size: 0.9em; margin: 0 0 20px 0;">
                    Error: ${errorMsg}
                </p>
                <button class="close-modal-btn" onclick="this.closest('.modal-overlay').remove();" style="font-size: 1.1em; padding: 12px 32px;">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// ============================================
// UNEXPECTED ERROR MODAL (styled, no alert)
// ============================================
function showUnexpectedError(errorMsg) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 450px; border: 3px solid #ff6b6b; animation: modalSlideIn 0.3s ease;">
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4em; margin-bottom: 15px;">⚠️</div>
                <h2 style="color: #ff6b6b; margin: 0 0 15px 0;">Unexpected Error</h2>
                <p style="color: #ddd; font-size: 1em; line-height: 1.6; margin: 0 0 10px 0;">
                    Something went wrong. Please try again.
                </p>
                <p style="color: #888; font-size: 0.85em; font-family: monospace; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 0 0 20px 0; word-break: break-word;">
                    ${errorMsg}
                </p>
                <button class="close-modal-btn" onclick="this.closest('.modal-overlay').remove();" style="font-size: 1.1em; padding: 12px 32px;">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Log module load
