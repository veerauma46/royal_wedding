/* register.js - Royal Wedding Planner Registration Logic */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // 1. Password Strength Calculator (Real-time checks)
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value;
            const strength = checkPasswordStrength(val);
            updateStrengthIndicator(strength);
        });
    }

    function checkPasswordStrength(password) {
        let score = 0;
        if (!password) return 0;
        if (password.length >= 6) score++;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score; // 0 to 5
    }

    function updateStrengthIndicator(score) {
        if (!strengthBar || !strengthText) return;
        
        let width = '0%';
        let color = '#E2E8F0';
        let text = 'Weak';
        let textColor = '#e71d36';

        if (score > 0 && score <= 2) {
            width = '33%';
            color = '#e71d36'; // Weak (Red)
            text = 'Weak';
            textColor = '#e71d36';
        } else if (score > 2 && score <= 4) {
            width = '66%';
            color = '#ff9f1c'; // Medium (Orange)
            text = 'Medium';
            textColor = '#ff9f1c';
        } else if (score === 5) {
            width = '100%';
            color = '#2ec4b6'; // Strong (Green)
            text = 'Strong & Secure';
            textColor = '#2ec4b6';
        }

        strengthBar.style.width = width;
        strengthBar.style.backgroundColor = color;
        strengthText.innerText = text;
        strengthText.style.color = textColor;
    }

    // 2. Show/Hide Password Toggle
    setupPasswordToggle(passwordToggle, passwordInput);
    setupPasswordToggle(confirmPasswordToggle, confirmPasswordInput);

    function setupPasswordToggle(toggleBtn, inputField) {
        if (toggleBtn && inputField) {
            toggleBtn.addEventListener('click', () => {
                const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
                inputField.setAttribute('type', type);
                if (type === 'text') {
                    toggleBtn.innerHTML = '&#128065;'; // open eye
                } else {
                    toggleBtn.innerHTML = '&#128064;'; // closed eye
                }
            });
        }
    }

    // 3. Registration Submission & Real-time Validations
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Collect form fields
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phoneNumber = document.getElementById('phoneNumber').value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            const gender = document.querySelector('input[name="gender"]:checked')?.value || '';
            const weddingDate = document.getElementById('weddingDate').value;
            const city = document.getElementById('city').value.trim();
            
            // Backend fields mapping
            const brideName = document.getElementById('brideName').value.trim();
            const groomName = document.getElementById('groomName').value.trim();
            const weddingType = document.getElementById('weddingType').value;
            const budgetVal = document.getElementById('budget').value;
            const budget = budgetVal ? parseFloat(budgetVal) : null;
            const agreeTerms = document.getElementById('agreeTerms').checked;

            // Form validations
            if (!fullName) {
                showToast('Please enter your full name.', 'error');
                return;
            }
            if (!validateEmail(email)) {
                showToast('Please enter a valid email address.', 'error');
                return;
            }
            if (!validatePhone(phoneNumber)) {
                showToast('Please enter a valid 10-digit phone number.', 'error');
                return;
            }
            if (password.length < 6) {
                showToast('Password must be at least 6 characters long.', 'error');
                return;
            }
            if (password !== confirmPassword) {
                showToast('Passwords do not match.', 'error');
                return;
            }
            if (!agreeTerms) {
                showToast('You must agree to the Terms and Conditions to proceed.', 'error');
                return;
            }

            // Show Loading Spinner
            showLoading(true);

            // Assemble DTO request body
            const requestBody = {
                fullName,
                email,
                phoneNumber,
                password,
                brideName: brideName || null,
                groomName: groomName || null,
                weddingDate: weddingDate || null,
                weddingType: weddingType || 'Traditional',
                budget: budget,
                address: city // City maps to 'address' field in Spring Boot DTO
            };

            try {
                // Register request to Spring Boot Auth API
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();
                showLoading(false);

                if (response.ok && data.token) {
                    showToast('Registration Successful! Logging you in...', 'success');
                    
                    // Store credentials
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('email', data.email);
                    localStorage.setItem('fullName', data.fullName);
                    localStorage.setItem('role', data.role);

                    // Redirect to home
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    showToast(data.message || 'Registration failed. Email might already exist.', 'error');
                }
            } catch (error) {
                showLoading(false);
                console.error('Error during registration fetch:', error);
                
                // Fallback mock registration for standalone/offline demo showcase
                handleMockRegistration(requestBody);
            }
        });
    }

    // Helper functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^\d{10}$/;
        return re.test(phone);
    }

    function showLoading(show) {
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    // Standalone mock registration
    function handleMockRegistration(body) {
        console.warn('Backend is offline. Running registration mock fallback...');
        showToast('Registration Successful (Demo Offline Mode)!', 'success');

        localStorage.setItem('token', 'mock-jwt-token-xyz-123');
        localStorage.setItem('email', body.email);
        localStorage.setItem('fullName', body.fullName);
        localStorage.setItem('role', 'ROLE_USER');

        // Store mock user profile details in local cache for offline editing
        localStorage.setItem('mockUserProfile', JSON.stringify({
            fullName: body.fullName,
            email: body.email,
            phoneNumber: body.phoneNumber,
            brideName: body.brideName || 'Bride Name',
            groomName: body.groomName || 'Groom Name',
            weddingDate: body.weddingDate || '',
            weddingType: body.weddingType || 'Traditional',
            budget: body.budget || 10000,
            address: body.address || 'Your City',
            role: 'ROLE_USER'
        }));

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }

    // Toast Alert Notification utility
    function showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let prefix = 'ℹ️';
        if (type === 'success') prefix = '💖';
        if (type === 'error') prefix = '⚠️';

        toast.innerHTML = `
            <span>${prefix} &nbsp; ${message}</span>
            <span class="toast-close">&times;</span>
        `;

        container.appendChild(toast);

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
});
