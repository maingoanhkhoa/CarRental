document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Support both local (with .html) and Cloudflare Pages (without .html)
    if (path.endsWith('index.html') || path === '/' || path.endsWith('/') || path.endsWith('/index')) {
        initHome();
    } else if (path.includes('cars.html') || path.endsWith('/cars')) {
        initCars();
    } else if (path.includes('detail.html') || path.endsWith('/detail')) {
        initDetail();
    } else if (path.includes('booking.html') || path.endsWith('/booking')) {
        initBooking();
    } else if (path.includes('reviews.html') || path.endsWith('/reviews')) {
        if (typeof initReview === 'function') {
            initReview();
        }
    }
});

async function initHome() {
    const grid = document.getElementById('cars-grid');
    if (!grid) return;
    try {
        const cars = await api.getCars();
        // Xe nổi bật ở Trang chủ: Thay xe đầu tiên (Ford Ranger) thành Honda City
        const hondaCity = cars.find(c => c.name.toLowerCase() === 'honda city');
        const otherCars = cars.filter(c => c.id !== (hondaCity ? hondaCity.id : null) && c.name !== 'Bán Tải Ford Ranger');
        const featuredCars = hondaCity ? [hondaCity, ...otherCars.slice(0, 2)] : cars.slice(0, 3);
        
        grid.innerHTML = featuredCars.map(car => ui.createCarCard(car)).join('');
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
        try {
            const apiParams = {};
            if (params.seats) apiParams.seats = params.seats;

            const cars = await api.getCars(apiParams);

            // Xử lý lọc theo khoảng giá ở Frontend (nếu có)
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

            // Đẩy Ford Ranger xuống cuối danh sách
            filteredCars.sort((a, b) => {
                const aIsRanger = a.name.toLowerCase().includes('ranger') ? 1 : 0;
                const bIsRanger = b.name.toLowerCase().includes('ranger') ? 1 : 0;
                return aIsRanger - bIsRanger;
            });

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
        document.getElementById('detail-name').textContent = car.name;

        document.getElementById('detail-seats').textContent = `${car.seats} chỗ`;
        document.getElementById('detail-transmission').textContent = car.transmission;
        document.getElementById('detail-fuel').textContent = car.fuel_type || 'Xăng';
        document.getElementById('detail-type').textContent = `${car.seats} chỗ`;

        // Update booking link
        const bookingLink = document.getElementById('detail-booking-link');
        if (bookingLink) {
            bookingLink.href = `booking.html?id=${car.id}`;
        }

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
        const prevGalleryBtn = document.getElementById('gallery-prev');
        if (prevGalleryBtn) {
            prevGalleryBtn.addEventListener('click', () => {
                const newIndex = (currentImageIndex - 1 + totalImages) % totalImages;
                showImage(newIndex);
                thumbPage = Math.floor(newIndex / thumbsPerPage);
                renderThumbs();
            });
        }

        const nextGalleryBtn = document.getElementById('gallery-next');
        if (nextGalleryBtn) {
            nextGalleryBtn.addEventListener('click', () => {
                const newIndex = (currentImageIndex + 1) % totalImages;
                showImage(newIndex);
                thumbPage = Math.floor(newIndex / thumbsPerPage);
                renderThumbs();
            });
        }

        // Thumbnail arrow navigation
        const prevThumbBtn = document.getElementById('thumb-prev');
        if (prevThumbBtn) {
            prevThumbBtn.addEventListener('click', () => {
                if (thumbPage > 0) {
                    thumbPage--;
                    renderThumbs();
                }
            });
        }

        const nextThumbBtn = document.getElementById('thumb-next');
        if (nextThumbBtn) {
            nextThumbBtn.addEventListener('click', () => {
                if (thumbPage < totalThumbPages - 1) {
                    thumbPage++;
                    renderThumbs();
                }
            });
        }

        // Initial render
        updateCounter();
        renderThumbs();

        // Hide thumb arrows if only 1 page
        if (totalThumbPages <= 1) {
            if (prevThumbBtn) prevThumbBtn.style.display = 'none';
            if (nextThumbBtn) nextThumbBtn.style.display = 'none';
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
            const similar = allCars.filter(c => String(c.id) !== String(carId)).slice(0, 3);
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
                                    <a href="detail.html?id=${c.id}" class="btn-view-details">Xem Chi Tiết</a>
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
        const contentEl = document.getElementById('detail-content');
        if (contentEl) {
            contentEl.classList.remove('d-none');
            contentEl.innerHTML = `
                <div style="text-align: center; padding: 4rem 1rem; width: 100%;">
                    <h3>Không tìm thấy thông tin xe</h3>
                    <p style="color: var(--text-gray); margin: 1rem 0 2rem;">Xe bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
                    <a href="cars.html" class="btn btn-primary">Xem Danh Sách Xe</a>
                </div>
            `;
        }
    }
}

function initBooking() {
    const form = document.getElementById('booking-form');
    if (!form) return;

    // Populate car-select dropdown if cars data is available
    const carSelect = document.getElementById('car-select');
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCarId = urlParams.get('id') || urlParams.get('car_id');

    if (carSelect && window.CARS && Array.isArray(window.CARS)) {
        window.CARS.forEach(car => {
            const opt = document.createElement('option');
            opt.value = car.id;
            opt.textContent = `${car.name} (${car.seats} chỗ)`;
            if (selectedCarId && String(car.id) === String(selectedCarId)) {
                opt.selected = true;
                const carInfoEl = document.getElementById('booking-car-info');
                if (carInfoEl) carInfoEl.textContent = `Đặt Xe: ${car.name}`;
            }
            carSelect.appendChild(opt);
        });

        carSelect.addEventListener('change', () => {
            const carInfoEl = document.getElementById('booking-car-info');
            if (carInfoEl) {
                const found = window.CARS.find(c => String(c.id) === String(carSelect.value));
                carInfoEl.textContent = found ? `Đặt Xe: ${found.name}` : 'Để lại thông tin';
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : '';

        const nameVal = document.getElementById('name')?.value || '';
        const phoneVal = document.getElementById('phone')?.value || '';
        const rentalDateVal = document.getElementById('rental-date')?.value || '';
        const returnDateVal = document.getElementById('return-date')?.value || '';

        if (!nameVal.trim() || !phoneVal.trim() || !rentalDateVal || !returnDateVal) {
            const errorMsg = document.getElementById('error-msg');
            if (errorMsg) {
                errorMsg.textContent = 'Vui lòng điền đầy đủ các thông tin bắt buộc (*).';
                errorMsg.classList.remove('d-none');
            }
            return;
        }

        const data = {
            name: nameVal.trim(),
            email: document.getElementById('email')?.value || '',
            phone: phoneVal.trim(),
            rental_date: rentalDateVal,
            return_date: returnDateVal,
            car_id: carSelect ? carSelect.value : (selectedCarId || null),
            message: document.getElementById('message')?.value || ''
        };

        try {
            if (submitBtn) {
                submitBtn.textContent = 'Đang ghi nhận...';
                submitBtn.disabled = true;
            }

            await api.createBooking(data);

            const successMsg = document.getElementById('success-msg');
            const errorMsg = document.getElementById('error-msg');

            if (successMsg) {
                successMsg.textContent = 'Thông tin đặt xe đã được ghi nhận. Vui lòng liên hệ chúng tôi để xác nhận.';
                successMsg.classList.remove('d-none');
            }
            if (errorMsg) {
                errorMsg.classList.add('d-none');
            }

            form.reset();
        } catch (err) {
            console.error(err);
            const errorMsg = document.getElementById('error-msg');
            if (errorMsg) {
                errorMsg.textContent = err.message || 'Có lỗi xảy ra khi gửi thông tin.';
                errorMsg.classList.remove('d-none');
            }
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalBtnText || 'Để lại thông tin';
                submitBtn.disabled = false;
            }
        }
    });
}
