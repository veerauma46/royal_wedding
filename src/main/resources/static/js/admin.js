/* admin.js - Admin Dashboard Page Controller */

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');

    // Authenticate Admin Access
    if (!token || (role !== 'ROLE_ADMIN' && role !== 'ADMIN')) {
        showNotification('Access Denied. Admin authentication required.', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    // Set Welcome Name
    const welcome = document.getElementById('adminWelcomeName');
    if (welcome) {
        welcome.innerText = `Welcome, ${localStorage.getItem('fullName') || 'Administrator'}`;
    }

    // Bind Logout Hook
    const navLogoutLink = document.getElementById('navLogoutLink');
    if (navLogoutLink) {
        navLogoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            showNotification('Admin logged out.', 'info');
            setTimeout(() => window.location.href = 'login.html', 1000);
        });
    }

    // Initialize View Tabs
    window.showAdminSection = (sectionName) => {
        document.querySelectorAll('.admin-panel-section').forEach(sec => sec.classList.remove('active'));
        document.querySelectorAll('.admin-menu-item').forEach(item => item.classList.remove('active'));
        
        const secElem = document.getElementById(`sec-${sectionName}`);
        if (secElem) secElem.classList.add('active');

        // Highlight selected menu
        const menuItems = document.querySelectorAll('.admin-sidebar .admin-menu-item');
        menuItems.forEach(item => {
            if (item.innerText.toLowerCase().includes(sectionName)) {
                item.classList.add('active');
            }
        });

        // Trigger fetches based on tab selection
        if (sectionName === 'overview') loadStatisticsReport();
        else if (sectionName === 'bookings') loadBookingsList();
        else if (sectionName === 'users') loadUsersList();
        else if (sectionName === 'packages') loadPackagesList();
        else if (sectionName === 'venues') loadVenuesList();
        else if (sectionName === 'vendors') loadVendorsList();
    };

    // Load initial reports
    loadStatisticsReport();

    // 1. Dynamic reporting stats computed using Java Stream API
    async function loadStatisticsReport() {
        showLoading(true);
        try {
            const response = await fetch('/api/admin/statistics', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            showLoading(false);

            if (response.ok) {
                renderStatistics(data);
                return;
            }
        } catch (error) {
            showLoading(false);
            console.error('Error fetching admin statistics:', error);
        }
        
        // Mock Statistics Fallback
        renderStatistics({
            totalRevenue: 37500.0,
            averageReviewRating: 4.85,
            bookingsByPackage: { 'Silver Package': 1, 'Gold Package': 3, 'Platinum Package': 2, 'Royal Package': 1 },
            availableVenuesCount: 3,
            totalUsersCount: 8,
            totalBookingsCount: 7,
            totalVenuesCount: 4,
            totalVendorsCount: 5,
            latestBookings: [
                { id: 101, bookingDate: '2026-11-24', user: { fullName: 'Uma Shankar' }, packageName: 'Gold Package', totalPrice: 10000.0 },
                { id: 102, bookingDate: '2026-11-25', user: { fullName: 'David & Grace' }, packageName: 'Platinum Package', totalPrice: 15000.0 },
                { id: 103, bookingDate: '2026-12-05', user: { fullName: 'Omar & Fatima' }, packageName: 'Silver Package', totalPrice: 5000.0 }
            ]
        });
    }

    function renderStatistics(stats) {
        document.getElementById('statRevenue').innerText = `$${stats.totalRevenue.toLocaleString()}`;
        document.getElementById('statRating').innerText = `${stats.averageReviewRating.toFixed(2)} / 5`;
        document.getElementById('statUsers').innerText = stats.totalUsersCount;
        document.getElementById('statVenues').innerText = `${stats.availableVenuesCount} / ${stats.totalVenuesCount}`;

        // Render package ratio bar charts
        const ratioBox = document.getElementById('packageRatiosContainer');
        if (ratioBox) {
            ratioBox.innerHTML = '';
            const total = stats.totalBookingsCount || 1;
            
            Object.keys(stats.bookingsByPackage).forEach(pkg => {
                const count = stats.bookingsByPackage[pkg];
                const pct = Math.round((count / total) * 100);
                
                ratioBox.innerHTML += `
                    <div class="ratio-bar-wrapper">
                        <div class="ratio-bar-label">
                            <span>${pkg}</span>
                            <span>${count} bookings (${pct}%)</span>
                        </div>
                        <div class="ratio-bar-track">
                            <div class="ratio-bar-fill" style="width: ${pct}%;"></div>
                        </div>
                    </div>
                `;
            });
        }

        // Render latest bookings table
        const tbody = document.getElementById('latestBookingsTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            stats.latestBookings.forEach(b => {
                const name = b.user ? b.user.fullName : 'Guest';
                const pkg = b.packageName || 'Service Reserve';
                tbody.innerHTML += `
                    <tr>
                        <td>${b.bookingDate}</td>
                        <td>${name}</td>
                        <td>${pkg}</td>
                        <td>$${b.totalPrice.toLocaleString()}</td>
                    </tr>
                `;
            });
        }
    }

    // 2. Bookings CRUD & Stream Searches
    window.loadBookingsList = async () => {
        showLoading(true);
        try {
            const response = await fetch('/api/bookings', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            showLoading(false);
            if (response.ok) {
                renderAllBookings(data);
            }
        } catch (error) {
            showLoading(false);
            console.error('Error fetching bookings:', error);
            // Offline mock bookings
            renderAllBookings([
                { id: 101, bookingDate: '2026-11-24', user: { fullName: 'Uma Shankar' }, packageName: 'Gold Package', totalPrice: 10000.0, status: 'CONFIRMED' },
                { id: 102, bookingDate: '2026-11-25', user: { fullName: 'David & Grace' }, packageName: 'Platinum Package', totalPrice: 15000.0, status: 'PENDING' },
                { id: 103, bookingDate: '2026-12-05', user: { fullName: 'Omar & Fatima' }, packageName: 'Silver Package', totalPrice: 5000.0, status: 'CANCELLED' }
            ]);
        }
    };

    function renderAllBookings(list) {
        const tbody = document.getElementById('allBookingsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No bookings found.</td></tr>`;
            return;
        }

        list.forEach(b => {
            const name = b.user ? b.user.fullName : 'Guest Client';
            const detail = b.packageName || 'Vendor Service';
            const statusClass = b.status.toLowerCase() === 'confirmed' ? 'status-confirmed' : b.status.toLowerCase() === 'cancelled' ? 'status-cancelled' : 'status-pending';
            
            let actionButtons = '';
            if (b.status === 'PENDING') {
                actionButtons = `
                    <button class="btn btn-primary btn-small btn-success" onclick="approveBooking(${b.id})">Approve</button>
                    <button class="btn btn-outline btn-danger btn-small" onclick="cancelBooking(${b.id})">Reject</button>
                `;
            } else {
                actionButtons = `<button class="btn btn-outline btn-danger btn-small" onclick="deleteBooking(${b.id})">Delete</button>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>#${b.id}</td>
                    <td>${b.bookingDate}</td>
                    <td><strong>${name}</strong></td>
                    <td>${detail}</td>
                    <td>$${b.totalPrice.toLocaleString()}</td>
                    <td><span class="status-badge ${statusClass}">${b.status}</span></td>
                    <td><div class="action-btn-group">${actionButtons}</div></td>
                </tr>
            `;
        });
    }

    // Search Bookings using dynamic filter API
    window.searchBookings = async () => {
        const query = document.getElementById('bookingSearchInput').value.trim();
        if (!query) {
            loadBookingsList();
            return;
        }
        showLoading(true);
        try {
            const response = await fetch(`/api/admin/bookings/search?customerName=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            showLoading(false);
            if (response.ok) {
                renderAllBookings(data);
            }
        } catch (error) {
            showLoading(false);
            console.error('Error searching bookings via API:', error);
        }
    };

    window.approveBooking = async (id) => {
        showLoading(true);
        try {
            const response = await fetch(`/api/bookings/${id}/status?status=CONFIRMED`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showLoading(false);
            if (response.ok) {
                showNotification('Booking reservation confirmed!', 'success');
                loadBookingsList();
            }
        } catch (error) {
            showLoading(false);
            showNotification('Approved successfully (Demo Mode).', 'success');
            loadBookingsList();
        }
    };

    window.cancelBooking = async (id) => {
        showLoading(true);
        try {
            const response = await fetch(`/api/bookings/${id}/status?status=CANCELLED`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showLoading(false);
            if (response.ok) {
                showNotification('Booking rejected/cancelled.', 'info');
                loadBookingsList();
            }
        } catch (error) {
            showLoading(false);
            showNotification('Rejected successfully (Demo Mode).', 'info');
            loadBookingsList();
        }
    };

    window.deleteBooking = async (id) => {
        if (!confirm('Are you sure you want to delete this booking record?')) return;
        showLoading(true);
        try {
            const response = await fetch(`/api/bookings/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showLoading(false);
            if (response.ok) {
                showNotification('Booking record deleted.', 'success');
                loadBookingsList();
            }
        } catch (error) {
            showLoading(false);
            showNotification('Deleted (Demo Mode).', 'success');
            loadBookingsList();
        }
    };

    // 3. User accounts list
    async function loadUsersList() {
        showLoading(true);
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            showLoading(false);
            if (response.ok) {
                renderUsersTable(data);
            }
        } catch (error) {
            showLoading(false);
            console.error('Error fetching users:', error);
            // Mock users
            renderUsersTable([
                { id: 1, fullName: 'Uma Shankar', email: 'uma@gmail.com', phoneNumber: '9876543210', weddingDate: '2026-11-24', role: 'ROLE_USER' },
                { id: 2, fullName: 'Royal Admin', email: 'admin@royalwedding.com', phoneNumber: '0000000000', weddingDate: null, role: 'ROLE_ADMIN' }
            ]);
        }
    }

    function renderUsersTable(list) {
        const tbody = document.getElementById('allUsersTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        list.forEach(u => {
            const date = u.weddingDate || 'N/A';
            const actionBtn = (u.role !== 'ROLE_ADMIN' && u.role !== 'ADMIN') ? 
                `<button class="btn btn-outline btn-danger btn-small" onclick="deleteUserAccount(${u.id})">Delete</button>` : 
                `<span style="color:#A0AEC0;">Protected</span>`;

            tbody.innerHTML += `
                <tr>
                    <td>#${u.id}</td>
                    <td>${u.fullName}</td>
                    <td>${u.email}</td>
                    <td>${u.phoneNumber || 'N/A'}</td>
                    <td>${date}</td>
                    <td><span class="status-badge" style="background:#E2E8F0;">${u.role}</span></td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });
    }

    window.deleteUserAccount = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        showLoading(true);
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showLoading(false);
            if (response.ok) {
                showNotification('User account deleted.', 'success');
                loadUsersList();
            }
        } catch (error) {
            showLoading(false);
            showNotification('User deleted (Demo Mode).', 'success');
            loadUsersList();
        }
    };


    // 4. CRUD: Packages, Venues, Vendors
    const adminCrudModal = document.getElementById('adminCrudModal');
    const crudForm = document.getElementById('crudForm');

    window.closeCrudModal = () => {
        if (adminCrudModal) adminCrudModal.classList.remove('active');
    };

    window.openAddModal = (type) => {
        if (!adminCrudModal) return;

        document.getElementById('crudModalTitle').innerText = `Add New ${type.toUpperCase()}`;
        document.getElementById('crudItemType').value = type;
        document.getElementById('crudItemId').value = '';
        crudForm.reset();

        // Toggle subfields based on type
        document.getElementById('venueFields').style.display = type === 'venue' ? 'block' : 'none';
        document.getElementById('vendorFields').style.display = type === 'vendor' ? 'block' : 'none';
        document.getElementById('packageFields').style.display = type === 'package' ? 'block' : 'none';

        adminCrudModal.classList.add('active');
    };

    // Submitting package/venue/vendor saves
    if (crudForm) {
        crudForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const type = document.getElementById('crudItemType').value;
            const id = document.getElementById('crudItemId').value;
            const name = document.getElementById('crudName').value.trim();
            const price = parseFloat(document.getElementById('crudPrice').value);
            const imageUrl = document.getElementById('crudImageUrl').value.trim();
            const description = document.getElementById('crudDesc').value.trim();

            let payload = { name, price, imageUrl, description };
            let url = '';

            if (type === 'package') {
                payload.features = document.getElementById('packageFeatures').value.trim();
                url = '/api/packages';
            } else if (type === 'venue') {
                payload.location = document.getElementById('venueLocation').value.trim();
                payload.capacity = parseInt(document.getElementById('venueCapacity').value);
                payload.isAvailable = true;
                url = '/api/venues';
            } else if (type === 'vendor') {
                payload.category = document.getElementById('vendorCategory').value;
                url = '/api/vendors';
            }

            let method = 'POST';
            if (id) {
                method = 'PUT';
                url += `/${id}`;
            }

            showLoading(true);
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                showLoading(false);

                if (response.ok) {
                    showNotification(`${type.toUpperCase()} saved successfully!`, 'success');
                    closeCrudModal();
                    showAdminSection(type + 's'); // refresh relevant tab
                }
            } catch (error) {
                showLoading(false);
                console.error('Error saving CRUD item:', error);
                showNotification(`Details saved (Demo Mode)!`, 'success');
                closeCrudModal();
                showAdminSection(type + 's');
            }
        });
    }

    // Load Packages List Tab
    async function loadPackagesList() {
        const tbody = document.getElementById('adminPackagesTableBody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading packages...</td></tr>';
        
        try {
            const response = await fetch('/api/packages');
            const data = await response.json();
            renderPackagesTable(data);
        } catch (error) {
            renderPackagesTable([
                { id: 1, name: 'Silver Package', price: 5000.0, description: 'Basic covering package', features: 'Essential Decor, Banquet, Sound' },
                { id: 2, name: 'Gold Package', price: 10000.0, description: 'Custom package description', features: 'Theme styling, photography, caterer' }
            ]);
        }
    }

    function renderPackagesTable(list) {
        const tbody = document.getElementById('adminPackagesTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        list.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>#${p.id}</td>
                    <td><strong>${p.name}</strong></td>
                    <td>$${p.price.toLocaleString()}</td>
                    <td>${p.description}</td>
                    <td>${p.features || 'None'}</td>
                    <td><button class="btn btn-outline btn-danger btn-small" onclick="deletePackageItem(${p.id})">Delete</button></td>
                </tr>
            `;
        });
    }

    window.deletePackageItem = async (id) => {
        if (!confirm('Delete this package?')) return;
        try {
            await fetch(`/api/packages/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadPackagesList();
        } catch (e) {
            showNotification('Deleted (Demo).', 'success');
            loadPackagesList();
        }
    };

    // Load Venues List Tab
    async function loadVenuesList() {
        const tbody = document.getElementById('adminVenuesTableBody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading venues...</td></tr>';

        try {
            const response = await fetch('/api/venues');
            const data = await response.json();
            renderVenuesTable(data);
        } catch (error) {
            renderVenuesTable([
                { id: 1, name: 'The Grand Royal Palace', location: 'Jaipur', capacity: 800, price: 12000.0, available: true }
            ]);
        }
    }

    function renderVenuesTable(list) {
        const tbody = document.getElementById('adminVenuesTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        list.forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td>#${v.id}</td>
                    <td><strong>${v.name}</strong></td>
                    <td>${v.location}</td>
                    <td>${v.capacity} guests</td>
                    <td>$${v.price.toLocaleString()}</td>
                    <td><span class="status-badge status-confirmed">${v.available ? 'Available' : 'Unavail'}</span></td>
                    <td><button class="btn btn-outline btn-danger btn-small" onclick="deleteVenueItem(${v.id})">Delete</button></td>
                </tr>
            `;
        });
    }

    window.deleteVenueItem = async (id) => {
        if (!confirm('Delete this venue?')) return;
        try {
            await fetch(`/api/venues/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadVenuesList();
        } catch (e) {
            showNotification('Deleted (Demo).', 'success');
            loadVenuesList();
        }
    };

    // Load Vendors List Tab
    async function loadVendorsList() {
        const tbody = document.getElementById('adminVendorsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading vendors...</td></tr>';

        try {
            const response = await fetch('/api/vendors');
            const data = await response.json();
            renderVendorsTable(data);
        } catch (error) {
            renderVendorsTable([
                { id: 1, name: 'Royal Clicks Studio', category: 'PHOTOGRAPHY', price: 2500.0, description: 'Candid storyteller' }
            ]);
        }
    }

    function renderVendorsTable(list) {
        const tbody = document.getElementById('adminVendorsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        list.forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td>#${v.id}</td>
                    <td><strong>${v.name}</strong></td>
                    <td><span class="status-badge" style="background:#E2E8F0;">${v.category}</span></td>
                    <td>$${v.price.toLocaleString()}</td>
                    <td>${v.description}</td>
                    <td><button class="btn btn-outline btn-danger btn-small" onclick="deleteVendorItem(${v.id})">Delete</button></td>
                </tr>
            `;
        });
    }

    window.deleteVendorItem = async (id) => {
        if (!confirm('Delete this vendor?')) return;
        try {
            await fetch(`/api/vendors/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadVendorsList();
        } catch (e) {
            showNotification('Deleted (Demo).', 'success');
            loadVendorsList();
        }
    };

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
