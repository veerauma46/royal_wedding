/* services.js - Services and Vendors Page Controller */

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

    // Services Catalog Loading
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    let loadedServices = [];
    let loadedVenues = [];

    // Attach search and filter events
    if (searchInput) searchInput.addEventListener('input', filterAndRenderCatalog);
    if (categorySelect) categorySelect.addEventListener('change', loadCatalogData);

    loadCatalogData();

    async function loadCatalogData() {
        const category = categorySelect.value;
        showLoading(true);

        try {
            // Fetch Services
            const sResponse = await fetch('/api/bookings/services');
            loadedServices = await sResponse.json();

            // Fetch Venues
            const vResponse = await fetch('/api/venues');
            loadedVenues = await vResponse.json();

            showLoading(false);
            filterAndRenderCatalog();
        } catch (error) {
            showLoading(false);
            console.warn('Backend is offline. Loading mock catalog...');
            loadMockCatalog();
        }
    }

    function loadMockCatalog() {
        loadedServices = [
            { id: 1, name: 'Royal Clicks Studio', category: 'PHOTOGRAPHY', price: 2500.0, description: 'Award-winning cinematic photographers specializing in candid storytelling and heritage wedding photography.', imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600' },
            { id: 2, name: 'Gourmet Royal Catering', category: 'CATERING', price: 4500.0, description: 'Curated luxury dining experience featuring multi-cuisine buffets, signature drinks, and live stations.', imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600' },
            { id: 3, name: 'Golden Petals Decorators', category: 'DECORATION', price: 5000.0, description: 'Intricate floral design, custom themes, premium stage draping, and dramatic chandelier lighting.', imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600' },
            { id: 4, name: 'Opulent Makeup Artistry', category: 'MAKEUP_ARTIST', price: 1200.0, description: 'Luxury bridal makeup, hair styling, draping, and customized trials by elite artists.', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600' },
            { id: 5, name: 'Royal Symphony Band', category: 'MUSIC_ENTERTAINMENT', price: 3500.0, description: 'Elite live classical instrumental band, saxophonists, violin groups, and celebrity DJ line-up.', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600' }
        ];

        loadedVenues = [
            { id: 1, name: 'The Grand Royal Palace', location: 'Jaipur, Rajasthan', capacity: 800, price: 12000.00, description: 'A heritage palace featuring majestic domes, sprawling lawns, and stunning Mughal courtyards.', imageUrl: 'https://images.unsplash.com/photo-1585909693685-7f5859e39b1a?q=80&w=600', isAvailable: true },
            { id: 2, name: 'Gold Leaf Banquet & Gardens', location: 'Udaipur, Rajasthan', capacity: 500, price: 9500.00, description: 'A serene lakeside luxury garden venue with dynamic lighting, pool deck, and glass banquet hall.', imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600', isAvailable: true }
        ];

        filterAndRenderCatalog();
    }

    function filterAndRenderCatalog() {
        const sGrid = document.getElementById('servicesGrid');
        if (!sGrid) return;

        const search = searchInput.value.trim().toLowerCase();
        const category = categorySelect.value;
        sGrid.innerHTML = '';

        let combined = [];

        // Add services based on category filter
        if (category === 'ALL' || category !== 'VENUE') {
            const filteredServices = loadedServices.filter(s => {
                const matchesCategory = (category === 'ALL' || s.category === category);
                const matchesSearch = s.name.toLowerCase().includes(search);
                return matchesCategory && matchesSearch;
            }).map(s => ({ ...s, itemType: 'service' }));
            combined = combined.concat(filteredServices);
        }

        // Add venues based on category filter
        if (category === 'ALL' || category === 'VENUE') {
            const filteredVenues = loadedVenues.filter(v => {
                const matchesSearch = v.name.toLowerCase().includes(search) || v.location.toLowerCase().includes(search);
                return matchesSearch;
            }).map(v => ({ ...v, itemType: 'venue', category: 'VENUE' }));
            combined = combined.concat(filteredVenues);
        }

        if (combined.length === 0) {
            sGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-color);">No services or venues found matching your criteria.</div>`;
            return;
        }

        combined.forEach(item => {
            const badge = item.category ? item.category.replace('_', ' ') : 'SERVICE';
            const priceSuffix = item.itemType === 'venue' ? '/ event day' : '/ service';
            const btnText = item.itemType === 'venue' ? 'Book Venue' : 'Book Service';
            const subtext = item.location ? `<p style="font-size:0.8rem; margin-top:-0.5rem; margin-bottom:0.5rem; color:var(--heading-color);">📍 ${item.location} (Capacity: ${item.capacity})</p>` : '';

            sGrid.innerHTML += `
                <div class="service-card">
                    <div class="service-img-wrapper">
                        <img class="service-img" src="${item.imageUrl}" alt="${item.name}">
                        <span class="service-badge">${badge}</span>
                    </div>
                    <div class="service-details">
                        <h3>${item.name}</h3>
                        ${subtext}
                        <p>${item.description}</p>
                        <div class="service-card-footer">
                            <div class="service-price">$${item.price.toLocaleString()} <span>${priceSuffix}</span></div>
                            <button class="btn btn-outline nav-btn" onclick="openBooking('${item.itemType}', ${item.id}, '${item.name}', ${item.price})">${btnText}</button>
                        </div>
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
            showNotification('Please login to book services.', 'error');
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
                if (type === 'service') {
                    document.getElementById('bookingItemId').name = 'serviceId';
                } else if (type === 'venue') {
                    document.getElementById('bookingItemId').name = 'venueId';
                }
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
                showNotification('Please select an event date.', 'error');
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
                    showNotification('Reservation request sent successfully!', 'success');
                    closeModal('bookingModal');
                } else {
                    showNotification('Failed to submit booking reservation.', 'error');
                }
            } catch (error) {
                showLoading(false);
                console.error('Error booking service:', error);
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
});
