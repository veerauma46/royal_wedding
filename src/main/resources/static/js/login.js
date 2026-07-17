/* login.js - Royal Wedding Planner Login Logic */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const emailInput = document.getElementById('email');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // 1. Password Visibility Toggle
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            // Toggle between showing symbol eye and slash (we use text content or icons)
            if (type === 'text') {
                passwordToggle.innerHTML = '&#128065;'; // open eye symbol
                passwordToggle.title = 'Hide password';
            } else {
                passwordToggle.innerHTML = '&#128064;'; // closed eye symbol
                passwordToggle.title = 'Show password';
            }
        });
    }

    // 2. Form submission handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const rememberMe = document.getElementById('rememberMe').checked;

            // Simple validations
            if (!validateEmail(email)) {
                showToast('Please enter a valid email address.', 'error');
                return;
            }

            if (!password) {
                showToast('Please enter your password.', 'error');
                return;
            }

            // Show Loading Spinner
            showLoading(true);

            try {
                // Post to Spring Boot Login Endpoint
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                showLoading(false);

                if (response.ok && data.token) {
                    showToast(data.message || 'Login Successful! Redirecting...', 'success');
                    
                    // Save Session details
                    const storage = rememberMe ? localStorage : sessionStorage;
                    storage.setItem('token', data.token);
                    storage.setItem('email', data.email);
                    storage.setItem('fullName', data.fullName);
                    storage.setItem('role', data.role);

                    // Redirect to home page
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    showToast(data.message || 'Invalid email or password.', 'error');
                }
            } catch (error) {
                showLoading(false);
                console.error('Error during login fetch:', error);
                
                // Fallback authentication check for standalone frontend showcase (offline mode)
                // Helpful for students running the frontend without launching Spring Boot
                handleMockLogin(email, password, rememberMe);
            }
        });
    }

    // Email regex validator
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Loading overlay utility
    function showLoading(show) {
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    // Standalone mock login (in case backend is offline)
    function handleMockLogin(email, password, rememberMe) {
        console.warn('Backend server is offline. Running frontend mock login fallback...');
        if ((email === 'uma@gmail.com' && (password === '123456' || password === 'password')) || 
            (email === 'admin@royalwedding.com' && password === '123456') ||
            (email === 'admin@royal.com' && password === 'admin123')) {
            
            showToast('Login Successful (Demo Offline Mode)!', 'success');
            
            const isAdmin = email.includes('admin');
            const data = {
                token: 'mock-jwt-token-xyz-123',
                email: email,
                fullName: isAdmin ? 'Royal Admin' : 'Uma Shankar',
                role: isAdmin ? 'ROLE_ADMIN' : 'ROLE_USER',
                message: 'Login Successful'
            };

            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('token', data.token);
            storage.setItem('email', data.email);
            storage.setItem('fullName', data.fullName);
            storage.setItem('role', data.role);

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showToast('Invalid credentials (Try: uma@gmail.com / 123456).', 'error');
        }
    }

    // Toast Alert Notification utility
    function showToast(message, type = 'info') {
        // Look for or create toast container
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

        // Bind close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Expose toast to global window context so it can be called in html inline handlers
    window.showNotification = showToast;
});
