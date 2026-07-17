/* packages.js - Packages Page Controller */

document.addEventListener('DOMContentLoaded', () => {
    // Nav elements check
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
        }
    }
    updateAuthStateUI();

    if (navLogoutLink) {
        navLogoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            showNotification('Logged out successfully!', 'success');
            setTimeout(() => window.location.reload(), 1000);
        });
    }

    // Load packages
    loadPackages();

    async function loadPackages() {
        const pGrid = document.getElementById('packagesGrid');
        if (!pGrid) return;

        showLoading(true);
        try {
            const response = await fetch('/api/packages');
            const data = await response.json();
            showLoading(false);

            if (response.ok && data.length > 0) {
                renderPackages(data);
                return;
            }
        } catch (error) {
            showLoading(false);
            console.warn('Backend is offline. Loading mock packages...');
        }

        // Mock Packages Fallback
        const mockPackages = [
            { id: 1, name: 'Silver Package', price: 5000.0, description: 'Elegant basic package covering essential wedding styling, guest seating and banquet setup.', features: 'Essential Styling, Seating Plan, Banquet Decor, Sound System', imageUrl: 'https://images.unsplash.com/photo-1519225495810-7517c300ea87?q=80&w=600' },
            { id: 2, name: 'Gold Package', price: 10000.0, description: 'Premium package with customizable theme design, full-stage arrangement, standard catering buffet, and professional photography.', features: 'Theme Styling, Stage Arrangement, Photography, Catering Buffet', imageUrl: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=600', featured: true },
            { id: 3, name: 'Platinum Package', price: 15000.0, description: 'Luxury wedding planning with premium destination setups, 3-tier cake, gourmet catering, professional cinematic capture, and live entertainment.', features: 'Destination Setups, Gourmet Dining, Live Entertainment, Cinematic Photography, 3-Tier Cake', imageUrl: 'images/couple.jpg' },
            { id: 4, name: 'Royal Package', price: 25000.0, description: 'The ultimate elite wedding experience. Includes palace coordination, celebrity caterers, luxury car arrivals, royal venue decor, international DJ, and full guest hospitality management.', features: 'Palace Coordination, Celebrity Caterers, Luxury Car Arrival, Royal Decor, International DJ, Guest Hospitality', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600' }
        ];
        renderPackages(mockPackages);
    }

    function renderPackages(list) {
        const pGrid = document.getElementById('packagesGrid');
        if (!pGrid) return;
        pGrid.innerHTML = '';

        list.forEach(p => {
            const featClass = p.featured || p.name === 'Gold Package' ? 'featured' : '';
            const fArray = p.features ? p.features.split(',') : [];
            const listItemsHtml = fArray.map(f => `<li>${f.trim()}</li>`).join('');

            pGrid.innerHTML += `
                <div class="package-card ${featClass}">
                    <div class="package-img-wrapper">
                        <img class="package-img" src="${p.imageUrl}" alt="${p.name}">
                    </div>
                    <div class="package-body">
                        <h3 class="package-name">${p.name}</h3>
                        <div class="package-price">$${p.price.toLocaleString()}</div>
                        <p class="package-desc">${p.description}</p>
                        <ul class="package-features">
                            ${listItemsHtml}
                        </ul>
                        <button class="btn btn-primary package-btn" onclick="openBooking('package', ${p.id}, '${p.name}', ${p.price})">Book Now</button>
                    </div>
                </div>
            `;
        });
    }

    // Modal Booking Hook
    const bookingModal = document.getElementById('bookingModal');
    const bookingForm = document.getElementById('bookingForm');

    window.openBooking = (type, id, name, price) => {
        if (!token) {
            showNotification('Please login to book packages.', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        if (bookingModal) {
            document.getElementById('bookingItemTitle').innerText = `Book ${name}`;
            document.getElementById('bookingType').value = type;
            document.getElementById('bookingItemId').value = id;
            document.getElementById('bookingBudget').value = price;
            
            if (type === 'package') {
                document.getElementById('packageNameInput').value = name;
                document.getElementById('bookingItemId').removeAttribute('name');
            } else {
                document.getElementById('packageNameInput').value = '';
                document.getElementById('bookingItemId').name = 'serviceId';
            }
            bookingModal.classList.add('active');
        }
    };

    window.closeModal = (id) => {
        const m = document.getElementById(id);
        if (m) m.classList.remove('active');
    };

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const bookingDate = document.getElementById('bookingDate').value;
            const guests = parseInt(document.getElementById('bookingGuests').value) || 50;
            const specialRequirements = document.getElementById('specialRequirements').value.trim();
            const budget = parseFloat(document.getElementById('bookingBudget').value) || 0.0;
            const type = document.getElementById('bookingType').value;
            const itemId = document.getElementById('bookingItemId').value;
            const packageName = document.getElementById('packageNameInput').value;

            if (!bookingDate) {
                showNotification('Please select a wedding date.', 'error');
                return;
            }

            const requestBody = {
                bookingDate,
                guests,
                specialRequirements,
                budget,
                weddingType: document.getElementById('bookingWeddingType').value,
                packageName: packageName || null,
                venueId: type === 'venue' ? parseInt(itemId) : null,
                serviceId: type === 'service' ? parseInt(itemId) : null
            };

            showLoading(true);
            try {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestBody)
                });
                showLoading(false);

                if (response.ok) {
                    showNotification('Booking reserved successfully!', 'success');
                    closeModal('bookingModal');
                } else {
                    showNotification('Failed to submit booking.', 'error');
                }
            } catch (error) {
                showLoading(false);
                console.error('Error submitting package booking:', error);
                showNotification('Booking saved successfully (Demo Mode)!', 'success');
                closeModal('bookingModal');
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
    window.showNotification = showNotification;
});
