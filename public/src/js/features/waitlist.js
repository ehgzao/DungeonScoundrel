/* ============================================
   WAITLIST SYSTEM
   Mobile Detection and Waitlist Management
   Extracted from index.html inline scripts
   ============================================ */

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
            if (isMobileDevice() && !hasDismissedMobileWarning()) {
                document.getElementById('mobileWaitlistModal').classList.add('active');
                // Prevent scrolling on body
                document.body.style.overflow = 'hidden';
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
            
            console.log('Sending waitlist signup:', params);
            
            // Send via EmailJS (using waitlist template)
            if (window.emailjs) {
                emailjs.send('service_tfl51qs', 'template_hif1mc1', params)
                    .then(function(response) {
                        console.log('Waitlist signup SUCCESS:', response);
                        
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

// Log module load
console.log('[WAITLIST SYSTEM] Module loaded. Mobile device:', isMobileDevice());
