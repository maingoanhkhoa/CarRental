document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.endsWith('index.html') || path === '/' || path.includes('/index.html')) {
        initHome();
    } else if (path.includes('cars.html')) {
        initCars();
    } else if (path.includes('detail.html')) {
        initDetail();
    } else if (path.includes('booking.html')) {
        initBooking();
    }
});

async function initHome() {
    const grid = document.getElementById('cars-grid');
    if (!grid) return;
    try {
        const cars = await api.getCars();
        // Just show first 3 for featured
        grid.innerHTML = cars.slice(0, 3).map(car => ui.createCarCard(car)).join('');
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<p class="text-center">Không tìm thấy xe nào.</p>';
    }
}

async function initCars() {
    const grid = document.getElementById('cars-grid');
    const filterForm = document.getElementById('filter-form');
    if (!grid) return;

    const loadCars = async (params = {}) => {
        grid.innerHTML = '<p class="text-center">Đang tải danh sách xe...</p>';
        try {
            // Lấy danh sách qua api, truyền theo tham số API hiện tại (seats)
            const apiParams = {};
            if (params.seats) apiParams.seats = params.seats;
            
            const cars = await api.getCars(apiParams);
            
            // Xử lý lọc theo khoảng giá ở Frontend (do backend cơ bản chưa có lọc min/max price)
            let filteredCars = cars;
            if (params.priceRange) {
                filteredCars = cars.filter(c => {
                    const p = parseFloat(c.price_per_day);
                    if (params.priceRange === '600000-700000') return p >= 600000 && p <= 700000;
                    if (params.priceRange === '800000-1000000') return p >= 800000 && p <= 1000000;
                    if (params.priceRange === '>1000000') return p > 1000000;
                    return true;
                });
            }

            if (filteredCars.length === 0) {
                grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Không tìm thấy xe nào phù hợp.</p>';
                return;
            }
            grid.innerHTML = filteredCars.map(car => ui.createCarCard(car)).join('');
        } catch (err) {
            console.error(err);
            grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Lỗi tải dữ liệu xe.</p>';
        }
    };

    if (filterForm) {
        filterForm.addEventListener('change', () => {
            const selectedSeat = filterForm.querySelector('input[name="seats"]:checked')?.value || '';
            // const priceRange = document.getElementById('price-dropdown')?.value || ''; //price filter
            
            loadCars({ seats: selectedSeat });
        });
    }

    loadCars();
}

async function initDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');
    if (!carId) {
        window.location.href = 'cars.html';
        return;
    }

    try {
        const car = await api.getCarDetails(carId);
        const loadingEl = document.getElementById('loading');
        const contentEl = document.getElementById('detail-content');
        
        if (loadingEl) loadingEl.classList.add('d-none');
        if (contentEl) contentEl.classList.remove('d-none');

        const imgUrl = car.image_url || 'https://via.placeholder.com/800x500';

        document.getElementById('detail-img').src = imgUrl;
        document.getElementById('detail-img').alt = car.name;
        document.getElementById('detail-desc').textContent = car.description || 'Không có mô tả cho xe này.';

        // Update page title
        document.title = `${car.name} - Vũ Đầm Sen`;

        const formattedPrice = parseFloat(car.price_per_day) > 1000
            ? parseFloat(car.price_per_day).toLocaleString('vi-VN')
            : car.price_per_day;
        document.getElementById('detail-price').innerHTML = `${formattedPrice}₫ <span>/ngày</span>`;

        document.getElementById('detail-seats').textContent = `${car.seats} chỗ`;
        document.getElementById('detail-transmission').textContent = car.transmission;
        document.getElementById('detail-fuel').textContent = car.fuel_type || 'Xăng';
        document.getElementById('detail-type').textContent = `${car.seats} chỗ`;

        // ── Build gallery: main image_url first, then additional images ──
        const allImages = [imgUrl];
        if (car.images && car.images.length > 0) {
            car.images.forEach(img => allImages.push(img.image_url));
        }

        let currentImageIndex = 0;
        const totalImages = allImages.length;
        let thumbPage = 0;
        const thumbsPerPage = 3;
        const totalThumbPages = Math.ceil(totalImages / thumbsPerPage);

        // Update gallery counter
        function updateCounter() {
            const counter = document.getElementById('gallery-counter');
            if (counter) counter.textContent = `${currentImageIndex + 1} / ${totalImages}`;
        }

        // Update main image
        function showImage(index) {
            currentImageIndex = index;
            document.getElementById('detail-img').src = allImages[index];
            updateCounter();
            // Update thumb active state
            document.querySelectorAll('.detail-thumb').forEach(t => {
                const thumbIdx = parseInt(t.dataset.index);
                t.classList.toggle('active', thumbIdx === index);
            });
        }

        // Render visible thumbnails based on page
        function renderThumbs() {
            const thumbsContainer = document.getElementById('detail-thumbs');
            if (!thumbsContainer) return;

            const start = thumbPage * thumbsPerPage;
            const end = Math.min(start + thumbsPerPage, totalImages);
            const visibleImages = allImages.slice(start, end);

            thumbsContainer.innerHTML = visibleImages.map((src, i) => {
                const globalIndex = start + i;
                return `
                    <div class="detail-thumb ${globalIndex === currentImageIndex ? 'active' : ''}" data-index="${globalIndex}">
                        <img src="${src}" alt="thumbnail ${globalIndex + 1}" crossorigin="anonymous">
                    </div>
                `;
            }).join('');

            // Add click handlers
            thumbsContainer.querySelectorAll('.detail-thumb').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const idx = parseInt(thumb.dataset.index);
                    showImage(idx);
                });
            });

            // Update thumb arrow states
            const prevThumb = document.getElementById('thumb-prev');
            const nextThumb = document.getElementById('thumb-next');
            if (prevThumb) prevThumb.disabled = thumbPage <= 0;
            if (nextThumb) nextThumb.disabled = thumbPage >= totalThumbPages - 1;
        }

        // Gallery navigation arrows
        document.getElementById('gallery-prev').addEventListener('click', () => {
            const newIndex = (currentImageIndex - 1 + totalImages) % totalImages;
            showImage(newIndex);
            // Auto-adjust thumb page to show active thumb
            thumbPage = Math.floor(newIndex / thumbsPerPage);
            renderThumbs();
        });

        document.getElementById('gallery-next').addEventListener('click', () => {
            const newIndex = (currentImageIndex + 1) % totalImages;
            showImage(newIndex);
            thumbPage = Math.floor(newIndex / thumbsPerPage);
            renderThumbs();
        });

        // Thumbnail arrow navigation
        document.getElementById('thumb-prev').addEventListener('click', () => {
            if (thumbPage > 0) {
                thumbPage--;
                renderThumbs();
            }
        });

        document.getElementById('thumb-next').addEventListener('click', () => {
            if (thumbPage < totalThumbPages - 1) {
                thumbPage++;
                renderThumbs();
            }
        });

        // Initial render
        updateCounter();
        renderThumbs();

        // Hide thumb arrows if only 1 page
        if (totalThumbPages <= 1) {
            const prevThumb = document.getElementById('thumb-prev');
            const nextThumb = document.getElementById('thumb-next');
            if (prevThumb) prevThumb.style.display = 'none';
            if (nextThumb) nextThumb.style.display = 'none';
        }

        // Hide entire thumb section if only 1 image
        if (totalImages <= 1) {
            const wrapper = document.querySelector('.detail-thumbs-wrapper');
            if (wrapper) wrapper.style.display = 'none';
        }

        // ── Populate car details info section ──
        const brandEl = document.getElementById('detail-brand');
        const modelEl = document.getElementById('detail-model');
        const yearEl = document.getElementById('detail-year');
        const colorEl = document.getElementById('detail-color');
        const fuelTypeEl = document.getElementById('detail-fuel-type');

        if (brandEl) brandEl.textContent = car.brand || 'Khác';
        if (modelEl) modelEl.textContent = car.model || '—';
        if (yearEl) yearEl.textContent = car.year || '—';
        if (colorEl) colorEl.textContent = car.color || '—';
        if (fuelTypeEl) fuelTypeEl.textContent = car.fuel_type || 'Xăng';

        // ── Populate features ──
        const featuresEl = document.getElementById('detail-features');
        if (featuresEl) {
            const features = car.features 
                ? car.features.split(',').map(f => f.trim()).filter(f => f.length > 0)
                : ['Điều hòa', 'Camera lùi', 'Cảm biến đỗ xe', 'Bluetooth', 'Ghế da'];

            featuresEl.innerHTML = features.map(f => `
                <div class="feature-item">
                    <svg class="feature-check" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span>${f}</span>
                </div>
            `).join('');
        }


        // Load similar cars (exclude current)
        const similarGrid = document.getElementById('similar-grid');
        if (similarGrid) {
            const allCars = await api.getCars();
            const similar = allCars.filter(c => c.id != carId).slice(0, 3);
            if (similar.length > 0) {
                similarGrid.innerHTML = similar.map(c => {
                    const img = c.image_url || 'https://via.placeholder.com/600x400?text=Car';
                    const price = parseFloat(c.price_per_day) > 1000
                        ? parseFloat(c.price_per_day).toLocaleString('vi-VN')
                        : c.price_per_day;
                    return `
                        <div class="similar-card">
                            <img src="${img}" alt="${c.name}" crossorigin="anonymous">
                            <div class="similar-info">
                                <h3>${c.name}</h3>
                                <div class="similar-footer">
                                    <div class="similar-price">${price}₫<span>/ngày</span></div>
                                    <a href="detail.html?id=${c.id}" class="btn-view-details ">Xem Chi Tiết</a>
                                </div>
                            </div>
                        </div>`;
                }).join('');
            } else {
                similarGrid.innerHTML = '<p style="color:var(--text-gray)">Không có xe tương tự.</p>';
            }
        }
    } catch (err) {
        console.error(err);
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.textContent = 'Không thể tải thông tin xe. Vui lòng thử lại.';
    }
}


function initBooking() {
    const form = document.getElementById('booking-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let messageVal = '';
        const msgInput = document.getElementById('message');
        if (msgInput) messageVal = msgInput.value;

        const data = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            rental_date: document.getElementById('rental-date').value,
            return_date: document.getElementById('return-date').value,
            message: messageVal
        };

        try {
            document.querySelector('#booking-form button[type="submit"]').textContent = 'Submitting...';
            document.querySelector('#booking-form button[type="submit"]').disabled = true;
            await api.createBooking(data);
            document.getElementById('success-msg').classList.remove('d-none');
            document.getElementById('error-msg').classList.add('d-none');
            form.reset();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } catch (err) {
            console.error(err);
            document.getElementById('error-msg').textContent = err.message || 'Error submitting booking.';
            document.getElementById('error-msg').classList.remove('d-none');
            document.querySelector('#booking-form button[type="submit"]').textContent = 'Confirm Booking';
            document.querySelector('#booking-form button[type="submit"]').disabled = false;
        }
    });
}
