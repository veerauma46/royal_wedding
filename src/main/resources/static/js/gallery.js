/* gallery.js - Gallery Page Controller */

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

    // Gallery details
    let galleryData = [];
    let currentFilteredList = [];
    let currentActiveIndex = 0;

    loadGalleryData();

    async function loadGalleryData() {
        showLoading(true);
        try {
            const response = await fetch('/api/gallery/images');
            galleryData = await response.json();
            showLoading(false);
            if (galleryData.length > 0) {
                renderGalleryGrid();
                return;
            }
        } catch (error) {
            showLoading(false);
            console.warn('Backend offline or requires authentication. Loading mock gallery...');
        }
        
        loadMockGallery();
    }

    function loadMockGallery() {
        galleryData = [
            { id: 1, imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600', albumName: 'hindu', caption: 'Vibrant Traditional Mandap Garland Exchange' },
            { id: 2, imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600', albumName: 'hindu', caption: 'Bride & Groom Walking Around Sacred Fire' },
            { id: 3, imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600', albumName: 'christian', caption: 'Walking Down the Aisle at St. Marys Cathedral' },
            { id: 4, imageUrl: 'https://images.unsplash.com/photo-1519225495810-7517c300ea87?q=80&w=600', albumName: 'christian', caption: 'Elegant Glass Banquet Table Setup' },
            { id: 5, imageUrl: 'https://images.unsplash.com/photo-1507504038482-7621c330dfef?q=80&w=600', albumName: 'muslim', caption: 'Royal Nikah Ceremony Draped Canopy details' },
            { id: 6, imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600', albumName: 'catering', caption: 'Premium Multicuisine Catering Platter Setup' },
            { id: 7, imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600', albumName: 'decoration', caption: 'Rose Gold Theme Entrance Arches' },
            { id: 8, imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600', albumName: 'photography', caption: 'Candid Portrait in Palace Corridor' },
            { id: 9, imageUrl: 'images/couple.jpg', albumName: 'photography', caption: 'Bespoke Watercolor Illustration of Bride & Groom' }
        ];
        renderGalleryGrid();
    }

    function renderGalleryGrid() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const filterButtons = document.querySelectorAll('.filter-btn');
        let currentFilter = 'all';

        // Read active filter
        filterButtons.forEach(btn => {
            if (btn.classList.contains('active')) {
                currentFilter = btn.dataset.filter;
            }
        });

        // Filter list
        currentFilteredList = galleryData.filter(item => {
            return currentFilter === 'all' || item.albumName.toLowerCase() === currentFilter;
        });

        if (currentFilteredList.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-color);">No photos found in this category.</div>`;
            return;
        }

        currentFilteredList.forEach((item, index) => {
            const albumLabel = item.albumName ? item.albumName.charAt(0).toUpperCase() + item.albumName.slice(1) : 'Wedding';
            grid.innerHTML += `
                <div class="gallery-item" onclick="openLightbox(${index})">
                    <img src="${item.imageUrl}" alt="${item.caption || 'Royal Wedding inspiration'}">
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                            <h4>${item.caption || 'Wedding Inspiration'}</h4>
                            <p>${albumLabel}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Attach click events to filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGalleryGrid();
        });
    });

    // Custom Lightbox Slider Controls
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');

    window.openLightbox = (index) => {
        if (!lightboxModal || !lightboxImg) return;
        currentActiveIndex = index;
        updateLightboxImage();
        lightboxModal.classList.add('active');
    };

    window.closeLightbox = () => {
        if (lightboxModal) lightboxModal.classList.remove('active');
    };

    window.changeLightboxImage = (direction) => {
        currentActiveIndex += direction;
        if (currentActiveIndex < 0) {
            currentActiveIndex = currentFilteredList.length - 1;
        } else if (currentActiveIndex >= currentFilteredList.length) {
            currentActiveIndex = 0;
        }
        updateLightboxImage();
    };

    function updateLightboxImage() {
        const item = currentFilteredList[currentActiveIndex];
        if (item && lightboxImg && lightboxCaption) {
            lightboxImg.src = item.imageUrl;
            lightboxCaption.innerText = item.caption || 'Inspiration Snapshot';
        }
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
