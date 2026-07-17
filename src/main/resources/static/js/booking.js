/* booking.js - Booking and Budget Calculator Controller */

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

    // 1. Booking History loader
    loadBookingHistory();

    async function loadBookingHistory() {
        const tableBody = document.getElementById('userBookingsTableBody');
        if (!tableBody) return;

        if (!token) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Please <a href="login.html" style="font-weight:600; text-decoration:underline;">login</a> to view booking history.</td></tr>`;
            return;
        }

        try {
            const response = await fetch('/api/bookings', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                renderBookingsTable(data);
                return;
            }
        } catch (error) {
            console.warn('Backend is offline. Loading cached mock bookings...');
        }

        // Mock bookings load from cache
        const mockBookings = [
            { id: 101, bookingDate: '2026-11-24', packageName: 'Gold Package', totalPrice: 10000.0, status: 'CONFIRMED' },
            { id: 102, bookingDate: '2026-11-25', service: { name: 'Royal Clicks Studio', price: 2500.0 }, status: 'PENDING' }
        ];
        renderBookingsTable(mockBookings);
    }

    function renderBookingsTable(list) {
        const tableBody = document.getElementById('userBookingsTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (list.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">You have no active reservations yet.</td></tr>`;
            return;
        }

        list.forEach(b => {
            const detailName = b.packageName || (b.service ? b.service.name : '') || (b.venue ? b.venue.name : 'Wedding Service');
            const statusClass = b.status.toLowerCase() === 'confirmed' ? 'status-confirmed' : b.status.toLowerCase() === 'cancelled' ? 'status-cancelled' : 'status-pending';
            const actionButton = b.status !== 'CANCELLED' ? 
                `<button class="btn btn-outline btn-danger btn-small" onclick="cancelBooking(${b.id})">Cancel</button>` : 
                `<span style="color:#A0AEC0;">Cancelled</span>`;

            tableBody.innerHTML += `
                <tr>
                    <td>#${b.id}</td>
                    <td>${b.bookingDate}</td>
                    <td><strong>${detailName}</strong></td>
                    <td>$${b.totalPrice.toLocaleString()}</td>
                    <td><span class="status-badge ${statusClass}">${b.status}</span></td>
                    <td>${actionButton}</td>
                </tr>
            `;
        });
    }

    // Cancel booking method
    window.cancelBooking = async (id) => {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;

        showLoading(true);
        try {
            // Attempt to update status to Cancelled or delete in DB
            const response = await fetch(`/api/bookings/${id}/status?status=CANCELLED`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            showLoading(false);

            if (response.ok) {
                showNotification('Booking status cancelled successfully!', 'success');
                loadBookingHistory();
            } else {
                showNotification('Failed to update booking status.', 'error');
            }
        } catch (error) {
            showLoading(false);
            console.error('Error cancelling booking:', error);
            showNotification('Booking cancelled successfully (Demo Mode)!', 'success');
            loadBookingHistory();
        }
    };


    // 2. Budget Calculator Interactive Inputs & Logic
    const calcGuests = document.getElementById('calcGuests');
    const guestsCountVal = document.getElementById('guestsCountVal');
    const calcFood = document.getElementById('calcFood');
    const calcDecor = document.getElementById('calcDecor');
    const calcPhoto = document.getElementById('calcPhoto');
    const calcVenue = document.getElementById('calcVenue');
    const calcMusic = document.getElementById('calcMusic');
    const saveBudgetBtn = document.getElementById('saveBudgetBtn');

    if (calcGuests) {
        calcGuests.addEventListener('input', () => {
            guestsCountVal.innerText = calcGuests.value;
            recalculateBudget();
        });
    }

    // cost edits change calculations
    [calcFood, calcDecor, calcPhoto, calcVenue, calcMusic].forEach(elem => {
        if (elem) elem.addEventListener('input', recalculateBudget);
    });

    loadSavedBudget();

    function recalculateBudget() {
        const guests = parseInt(calcGuests.value) || 0;
        const foodCostPerGuest = parseFloat(calcFood.value) || 0.0;
        const decorationCost = parseFloat(calcDecor.value) || 0.0;
        const photographyCost = parseFloat(calcPhoto.value) || 0.0;
        const venueCost = parseFloat(calcVenue.value) || 0.0;
        const musicCost = parseFloat(calcMusic.value) || 0.0;

        const foodTotal = guests * foodCostPerGuest;
        const subtotal = foodTotal + decorationCost + photographyCost + venueCost + musicCost;
        const gst = subtotal * 0.18; // 18% GST tax
        const grandTotal = subtotal + gst;

        document.getElementById('outSubtotal').innerText = `$${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('outGst').innerText = `$${gst.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('outGrandTotal').innerText = `$${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    async function loadSavedBudget() {
        if (!token) {
            recalculateBudget();
            return;
        }

        try {
            const response = await fetch('/api/budget/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok && response.status !== 204) {
                const data = await response.json();
                prefillBudgetForm(data);
                return;
            }
        } catch (error) {
            console.warn('Backend is offline. Checking local storage cache for budget...');
        }

        // Check local storage mock cache
        const cache = localStorage.getItem('mockUserBudget');
        if (cache) {
            prefillBudgetForm(JSON.parse(cache));
        } else {
            recalculateBudget();
        }
    }

    function prefillBudgetForm(data) {
        calcGuests.value = data.guests || 150;
        guestsCountVal.innerText = data.guests || 150;
        
        // Per guest food cost calculation
        const foodCost = data.foodCost || 0;
        const perGuestFood = data.guests > 0 ? (foodCost / data.guests) : 45;
        calcFood.value = Math.round(perGuestFood);

        calcDecor.value = data.decorationCost || 2500;
        calcPhoto.value = data.photographyCost || 1800;
        calcVenue.value = data.venueCost || 5000;
        calcMusic.value = data.musicCost || 1200;

        recalculateBudget();
    }

    // Save Budget Details Handler
    if (saveBudgetBtn) {
        saveBudgetBtn.addEventListener('click', async () => {
            if (!token) {
                showNotification('Please log in to save budget configurations.', 'error');
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }

            const guests = parseInt(calcGuests.value);
            const perGuestFood = parseFloat(calcFood.value) || 0.0;
            const foodCost = guests * perGuestFood;
            const decorationCost = parseFloat(calcDecor.value) || 0.0;
            const photographyCost = parseFloat(calcPhoto.value) || 0.0;
            const venueCost = parseFloat(calcVenue.value) || 0.0;
            const musicCost = parseFloat(calcMusic.value) || 0.0;

            const requestBody = {
                guests,
                foodCost,
                decorationCost,
                photographyCost,
                venueCost,
                musicCost
            };

            showLoading(true);
            try {
                const response = await fetch('/api/budget/calculate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestBody)
                });
                showLoading(false);

                if (response.ok) {
                    showNotification('Wedding budget configuration saved successfully!', 'success');
                } else {
                    showNotification('Failed to save budget details.', 'error');
                }
            } catch (error) {
                showLoading(false);
                console.error('Error saving budget calculations:', error);
                
                // Fallback mock cache save
                localStorage.setItem('mockUserBudget', JSON.stringify(requestBody));
                showNotification('Budget details saved (Demo Mode)!', 'success');
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
