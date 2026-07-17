/* profile.js - User Profile Controller */

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const authButtons = document.getElementById('authButtons');
    const navProfileLink = document.getElementById('navProfileLink');
    const navLogoutLink = document.getElementById('navLogoutLink');

    function updateAuthStateUI() {
        if (token) {
            if (authButtons) authButtons.style.display = 'none';
            if (navProfileLink) navProfileLink.style.display = 'block';
            if (navLogoutLink) navLogoutLink.style.display = 'block';
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (navProfileLink) navProfileLink.style.display = 'none';
            if (navLogoutLink) navLogoutLink.style.display = 'none';
            
            // Guest block redirect
            showNotification('Access denied. Redirecting to login...', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
        }
    }
    updateAuthStateUI();

    if (navLogoutLink) {
        navLogoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            showNotification('Logged out successfully!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1000);
        });
    }

    const profileForm = document.getElementById('profileForm');
    loadUserProfile();

    async function loadUserProfile() {
        showLoading(true);
        try {
            const response = await fetch('/api/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            showLoading(false);

            if (response.ok) {
                populateProfileForm(data);
                return;
            }
        } catch (error) {
            showLoading(false);
            console.warn('Backend is offline. Checking local storage cache for profile...');
        }

        // Fallback to local profile cache
        const cache = localStorage.getItem('mockUserProfile');
        if (cache) {
            populateProfileForm(JSON.parse(cache));
        } else {
            populateProfileForm({
                fullName: localStorage.getItem('fullName') || 'Uma Shankar',
                email: localStorage.getItem('email') || 'uma@gmail.com',
                phoneNumber: '9876543210',
                brideName: 'Mowlika',
                groomName: 'Srikanth',
                weddingDate: '2026-11-24',
                weddingType: 'Traditional',
                budget: 15000,
                address: 'Hyderabad'
            });
        }
    }

    function populateProfileForm(data) {
        document.getElementById('headerFullName').innerText = data.fullName || 'Guest User';
        document.getElementById('headerEmail').innerText = data.email || 'user@royalwedding.com';

        document.getElementById('profFullName').value = data.fullName || '';
        document.getElementById('profEmail').value = data.email || '';
        document.getElementById('profPhone').value = data.phoneNumber || '';
        document.getElementById('profBrideName').value = data.brideName || '';
        document.getElementById('profGroomName').value = data.groomName || '';
        document.getElementById('profWeddingDate').value = data.weddingDate || '';
        document.getElementById('profWeddingType').value = data.weddingType || 'Traditional';
        document.getElementById('profBudget').value = data.budget || '';
        document.getElementById('profAddress').value = data.address || '';
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('profFullName').value.trim();
            const phoneNumber = document.getElementById('profPhone').value.trim();
            const password = document.getElementById('profPassword').value.trim();
            const brideName = document.getElementById('profBrideName').value.trim();
            const groomName = document.getElementById('profGroomName').value.trim();
            const weddingDate = document.getElementById('profWeddingDate').value;
            const weddingType = document.getElementById('profWeddingType').value;
            const budget = parseFloat(document.getElementById('profBudget').value) || 0.0;
            const address = document.getElementById('profAddress').value.trim();

            if (!fullName) {
                showNotification('Please enter your full name.', 'error');
                return;
            }

            const requestBody = {
                fullName,
                phoneNumber,
                brideName,
                groomName,
                weddingDate,
                weddingType,
                budget,
                address
            };

            if (password) requestBody.password = password;

            showLoading(true);
            try {
                const response = await fetch('/api/users/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestBody)
                });
                const data = await response.json();
                showLoading(false);

                if (response.ok) {
                    showNotification('Profile details updated successfully!', 'success');
                    localStorage.setItem('fullName', data.fullName);
                    loadUserProfile();
                } else {
                    showNotification(data.message || 'Failed to save changes.', 'error');
                }
            } catch (error) {
                showLoading(false);
                console.error('Error updating profile:', error);
                
                // Fallback cache update
                localStorage.setItem('fullName', fullName);
                localStorage.setItem('mockUserProfile', JSON.stringify({
                    fullName,
                    email: document.getElementById('profEmail').value,
                    phoneNumber,
                    brideName,
                    groomName,
                    weddingDate,
                    weddingType,
                    budget,
                    address,
                    role: 'ROLE_USER'
                }));
                showNotification('Profile configurations saved (Demo Cache)!', 'success');
                loadUserProfile();
            }
        });
    }

    function showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = show ? 'flex' : 'none';
    }

    function showNotification(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        let prefix = type === 'success' ? '💖' : type === 'error' ? '⚠️' : 'ℹ️';
        toast.innerHTML = `<span>${prefix} &nbsp; ${message}</span><span class="toast-close">&times;</span>`;
        container.appendChild(toast);
        toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
});
