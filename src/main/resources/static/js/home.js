/* home.js - Royal Wedding Planner Homepage Script */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Nav Toggle Menu
    const menuToggle = document.getElementById('menuToggle');
    const navbar = document.getElementById('navbar');
    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navbar.classList.toggle('active');
        });
    }

    // Close mobile menu when nav link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navbar && navbar.classList.contains('active')) {
                navbar.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    });

    // 3. User Session State Check
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    const authButtons = document.getElementById('authButtons');
    const navProfileLink = document.getElementById('navProfileLink');
    const navAdminLink = document.getElementById('navAdminLink');
    const navLogoutLink = document.getElementById('navLogoutLink');

    function updateAuthStateUI() {
        if (token) {
            // User is logged in
            if (authButtons) authButtons.style.display = 'none';
            if (navProfileLink) navProfileLink.style.display = 'block';
            if (navLogoutLink) navLogoutLink.style.display = 'block';
            if (navAdminLink) {
                navAdminLink.style.display = (role === 'ROLE_ADMIN' || role === 'ADMIN') ? 'block' : 'none';
            }
        } else {
            // User is logged out
            if (authButtons) authButtons.style.display = 'flex';
            if (navProfileLink) navProfileLink.style.display = 'none';
            if (navLogoutLink) navLogoutLink.style.display = 'none';
            if (navAdminLink) navAdminLink.style.display = 'none';
        }
    }
    updateAuthStateUI();

    // 4. Logout functionality
    if (navLogoutLink) {
        navLogoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
    }

    // 5. Load dynamic content (Packages, Services, Testimonials)
    loadPackages();
    loadServices();
    loadTestimonials();

    // 6. Modal Controls (Booking & Profile)
    const bookingModal = document.getElementById('bookingModal');
    const profileModal = document.getElementById('profileModal');
    const bookingForm = document.getElementById('bookingForm');
    const profileForm = document.getElementById('profileForm');

    // Open booking modal helper
    window.openBooking = (type, id, name, price) => {
        if (!token) {
            showNotification('Please login to book packages or services.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        if (bookingModal) {
            const bookingItemTitle = document.getElementById('bookingItemTitle');
            const bookingTypeInput = document.getElementById('bookingType');
            const bookingItemIdInput = document.getElementById('bookingItemId');
            const packageNameInput = document.getElementById('packageNameInput');
            const budgetInput = document.getElementById('bookingBudget');

            bookingItemTitle.innerText = `Book ${name}`;
            bookingTypeInput.value = type;
            bookingItemIdInput.value = id;
            budgetInput.value = price;

            if (type === 'package') {
                packageNameInput.value = name;
                bookingItemIdInput.removeAttribute('name'); // We don't need serviceId / venueId
            } else {
                packageNameInput.value = '';
                if (type === 'service') {
                    bookingItemIdInput.name = 'serviceId';
                } else if (type === 'venue') {
                    bookingItemIdInput.name = 'venueId';
                }
            }

            bookingModal.classList.add('active');
        }
    };

    // Close Modals
    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    };

    // Open Profile Modal (fetches info from backend)
    if (navProfileLink) {
        navProfileLink.addEventListener('click', async (e) => {
            e.preventDefault();
            if (profileModal) {
                profileModal.classList.add('active');
                
                // Load details
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
                    } else {
                        showNotification('Failed to load profile details from API.', 'error');
                    }
                } catch (error) {
                    showLoading(false);
                    console.error('Error fetching profile from server:', error);
                    // Fallback to local profile cache
                    const cache = localStorage.getItem('mockUserProfile');
                    if (cache) {
                        populateProfileForm(JSON.parse(cache));
                    } else {
                        // Standard template mock
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
            }
        });
    }

    function populateProfileForm(data) {
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

    // Submit Booking Form
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
                showNotification('Please select a booking date.', 'error');
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

                const data = await response.json();
                showLoading(false);

                if (response.ok) {
                    showNotification('Wedding Booking submitted successfully!', 'success');
                    closeModal('bookingModal');
                } else {
                    showNotification(data.message || 'Failed to submit booking.', 'error');
                }
            } catch (error) {
                showLoading(false);
                console.error('Error submitting booking:', error);
                
                // Fallback mock success
                showNotification('Booking saved successfully (Demo Mode)!', 'success');
                closeModal('bookingModal');
            }
        });
    }

    // Submit Profile update
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

            if (password) {
                requestBody.password = password; // Only send password if editing it
            }

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
                    showNotification('Profile updated successfully!', 'success');
                    localStorage.setItem('fullName', data.fullName);
                    updateAuthStateUI();
                    closeModal('profileModal');
                } else {
                    showNotification(data.message || 'Failed to update profile.', 'error');
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
                showNotification('Profile details updated (Local Cache)!', 'success');
                closeModal('profileModal');
            }
        });
    }

    // Submit Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const subject = document.getElementById('contactSubject').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name || !email || !message) {
                showNotification('Please fill in name, email, and message.', 'error');
                return;
            }

            showLoading(true);

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, subject, message })
                });

                showLoading(false);

                if (response.ok) {
                    showNotification('Your contact message has been sent successfully!', 'success');
                    contactForm.reset();
                } else {
                    showNotification('Failed to send message.', 'error');
                }
            } catch (error) {
                showLoading(false);
                console.error('Error submitting contact form:', error);
                showNotification('Your message has been sent (Demo Mode)!', 'success');
                contactForm.reset();
            }
        });
    }

    // 7. Gallery Category Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            galleryItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 8. Fetch dynamic Packages
    async function loadPackages() {
        const pGrid = document.getElementById('packagesGrid');
        if (!pGrid) return;

        try {
            const response = await fetch('/api/packages');
            const data = await response.json();

            if (response.ok && data.length > 0) {
                renderPackages(data);
                return;
            }
        } catch (error) {
            console.warn('Backend offline. Loading mock packages...');
        }
        
        // Fallback Package Seed data
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
            const featBadge = p.featured || p.name === 'Gold Package' ? '<span class="package-featured-badge">Featured</span>' : '';
            const fArray = p.features ? p.features.split(',') : [];
            const listItemsHtml = fArray.map(f => `<li>${f.trim()}</li>`).join('');

            pGrid.innerHTML += `
                <div class="package-card ${featClass} animate-on-scroll">
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
        setupObserver();
    }

    // 9. Fetch dynamic Services
    async function loadServices() {
        const sGrid = document.getElementById('servicesGrid');
        if (!sGrid) return;

        try {
            const response = await fetch('/api/bookings/services');
            const data = await response.json();

            if (response.ok && data.length > 0) {
                renderServices(data);
                return;
            }
        } catch (error) {
            console.warn('Backend offline. Loading mock services...');
        }

        // Fallback Service Seed data
        const mockServices = [
            { id: 1, name: 'The Grand Royal Palace', serviceType: 'VENUE_BOOKING', price: 12000.0, description: 'A heritage palace featuring majestic domes, sprawling lawns, and stunning Mughal courtyards.', imageUrl: 'https://images.unsplash.com/photo-1585909693685-7f5859e39b1a?q=80&w=600' },
            { id: 2, name: 'Gourmet Royal Catering', serviceType: 'CATERING', price: 4500.0, description: 'Curated luxury dining experience featuring multi-cuisine buffets, signature drinks, and live stations.', imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600' },
            { id: 3, name: 'Golden Petals Decorators', serviceType: 'DECORATION', price: 5000.0, description: 'Intricate floral design, custom themes, premium stage draping, and dramatic chandelier lighting.', imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600' },
            { id: 4, name: 'Royal Clicks Studio', serviceType: 'PHOTOGRAPHY', price: 2500.0, description: 'Award-winning cinematic photographers specializing in candid storytelling and heritage wedding photography.', imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600' },
            { id: 5, name: 'Opulent Makeup Artistry', serviceType: 'MAKEUP_ARTIST', price: 1200.0, description: 'Luxury bridal makeup, hair styling, draping, and customized trials by elite artists.', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600' },
            { id: 6, name: 'Royal Symphony Band', serviceType: 'MUSIC_ENTERTAINMENT', price: 3500.0, description: 'Elite live classical instrumental band, saxophonists, violin groups, and celebrity DJ line-up.', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600' }
        ];
        renderServices(mockServices);
    }

    function renderServices(list) {
        const sGrid = document.getElementById('servicesGrid');
        if (!sGrid) return;
        sGrid.innerHTML = '';

        list.forEach(s => {
            // Normalize serviceType name for badge presentation
            const badgeName = s.serviceType ? s.serviceType.replace('_', ' ') : 'SERVICE';
            sGrid.innerHTML += `
                <div class="service-card animate-on-scroll">
                    <div class="service-img-wrapper">
                        <img class="service-img" src="${s.imageUrl}" alt="${s.name}">
                        <span class="service-badge">${badgeName}</span>
                    </div>
                    <div class="service-details">
                        <h3>${s.name}</h3>
                        <p>${s.description}</p>
                        <div class="service-card-footer">
                            <div class="service-price">$${s.price.toLocaleString()} <span>/ service</span></div>
                            <button class="btn btn-outline nav-btn" onclick="openBooking('service', ${s.id}, '${s.name}', ${s.price})">Book Service</button>
                        </div>
                    </div>
                </div>
            `;
        });
        setupObserver();
    }

    // 10. Fetch dynamic Testimonials
    async function loadTestimonials() {
        const tGrid = document.getElementById('testimonialsGrid');
        if (!tGrid) return;

        try {
            const response = await fetch('/api/reviews');
            const data = await response.json();

            if (response.ok && data.length > 0) {
                renderTestimonials(data);
                return;
            }
        } catch (error) {
            console.warn('Backend offline. Loading mock reviews...');
        }

        // Fallback review seed data
        const mockReviews = [
            { id: 1, coupleName: 'Srikanth & Mowlika', rating: 5, comment: 'Royal Wedding made our special day unforgettable. Every decoration was beautiful and perfectly organized.', coupleImageUrl: 'https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?q=80&w=300' },
            { id: 2, coupleName: 'David & Grace', rating: 5, comment: 'The team was friendly and professional. Everything was planned exactly the way we wanted.', coupleImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300' },
            { id: 3, coupleName: 'Omar & Fatima', rating: 5, comment: 'We loved every moment of our wedding. Thank you Royal Wedding for making our dream come true.', coupleImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300' }
        ];
        renderTestimonials(mockReviews);
    }

    function renderTestimonials(list) {
        const tGrid = document.getElementById('testimonialsGrid');
        if (!tGrid) return;
        tGrid.innerHTML = '';

        list.forEach(t => {
            const starStr = '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating);
            tGrid.innerHTML += `
                <div class="testimonial-card animate-on-scroll">
                    <img class="testimonial-avatar" src="${t.coupleImageUrl}" alt="${t.coupleName}">
                    <div class="testimonial-stars">${starStr}</div>
                    <p class="testimonial-quote">"${t.comment}"</p>
                    <h4 class="testimonial-author">${t.coupleName}</h4>
                </div>
            `;
        });
        setupObserver();
    }

    // 11. Intersection Observer for Scroll Fade-ins
    function setupObserver() {
        const scrollElements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appeared');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });

        scrollElements.forEach(el => observer.observe(el));
    }
    setupObserver();

    // Loading overlay controls
    function showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = show ? 'flex' : 'none';
    }

    // Toast Alert Notification utility
    function showNotification(message, type = 'info') {
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
    window.showNotification = showNotification;
});
