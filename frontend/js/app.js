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
        grid.innerHTML = '<p class="text-center">Failed to load cars.</p>';
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
                grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Không tìm thấy xe nào phù hợp với bộ lọc.</p>';
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
            const priceRange = document.getElementById('price-dropdown')?.value || '';
            
            loadCars({ seats: selectedSeat, priceRange: priceRange });
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
        document.getElementById('loading').classList.add('d-none');
        document.getElementById('detail-content').classList.remove('d-none');

        const imgUrl = car.image_url || 'https://via.placeholder.com/800x500';

        document.getElementById('detail-img').src = imgUrl;
        document.getElementById('detail-img').alt = car.name;
        document.getElementById('detail-name').textContent = car.name;

        const formattedPrice = parseFloat(car.price_per_day) > 1000
            ? parseFloat(car.price_per_day).toLocaleString('vi-VN')
            : car.price_per_day;
        document.getElementById('detail-price').innerHTML = `${formattedPrice}₫ <span style="font-size: 1rem; color: var(--text-muted); font-weight: normal;">/ngày</span>`;

        document.getElementById('detail-seats').textContent = `${car.seats} chỗ`;
        document.getElementById('detail-transmission').textContent = car.transmission;
        document.getElementById('detail-fuel').textContent = car.fuel_type || 'Xăng';
        document.getElementById('detail-type').textContent = `${car.seats} chỗ`;

        const bookBtn = document.getElementById('book-btn');
        bookBtn.href = `booking.html?carId=${car.id}&name=${encodeURIComponent(car.name)}`;

        // Load similar cars (exclude current)
        const similarGrid = document.getElementById('similar-grid');
        if (similarGrid) {
            const allCars = await api.getCars();
            const similar = allCars.filter(c => c.id != carId).slice(0, 3);
            if (similar.length > 0) {
                similarGrid.innerHTML = similar.map(c => {
                    const img = c.image_url
                        ? (c.image_url.startsWith('http') ? c.image_url : IMAGE_BASE + c.image_url)
                        : 'https://via.placeholder.com/600x400?text=Car';
                    const price = parseFloat(c.price_per_day) > 1000
                        ? parseFloat(c.price_per_day).toLocaleString('vi-VN')
                        : c.price_per_day;
                    return `
                        <div class="similar-card" style="cursor:pointer;" onclick="location.href='detail.html?id=${c.id}'">
                            <img src="${img}" alt="${c.name}">
                            <div class="similar-info">
                                <h3>${c.name}</h3>
                                <div class="similar-price">${price}₫<span>/ngày</span></div>
                            </div>
                        </div>`;
                }).join('');
            } else {
                similarGrid.innerHTML = '<p style="color:var(--text-muted)">Không có xe tương tự.</p>';
            }
        }
    } catch (err) {
        console.error(err);
        document.getElementById('loading').textContent = 'Không thể tải thông tin xe. Vui lòng thử lại.';
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
