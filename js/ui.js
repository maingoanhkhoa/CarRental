window.ui = {
    renderNavbar() {
        const container = document.getElementById('navbar-container');
        if (!container) return;
        container.innerHTML = `
            <nav class="navbar">
                <div class="container">
                    <a href="index.html" class="navbar-brand">DriveEase</a>
                    <div class="nav-links">
                        <a href="index.html">Home</a>
                        <a href="cars.html">Cars</a>
                    </div>
                </div>
            </nav>
        `;
    },

    renderFooter() {
        const container = document.getElementById('footer-container');
        if (!container) return;
        container.innerHTML = `
            <footer>
                <div class="container">
                    <p>&copy; ${new Date().getFullYear()} DriveEase. All rights reserved.</p>
                </div>
            </footer>
        `;
    },

    createCarCard(car) {
        const imageUrl = car.image_url || 'https://via.placeholder.com/600x400';
        // Parse price appropriately
        const formattedPrice = parseFloat(car.price_per_day) > 1000 ?
            parseFloat(car.price_per_day).toLocaleString('vi-VN') :
            car.price_per_day;

        return `
            <div class="car-card">
                <img src="${imageUrl}" alt="${car.name}" class="car-img" crossorigin="anonymous">
                <div class="car-info">
                    <h3>${car.name}</h3>
                    <div class="car-meta">
                        <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>${car.seats} chỗ</span>
                        <span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.79l.867-1.221m7.264-10.246.867-1.221m-4.5 12.18v-1.49m0-11.48v-1.49m-4.502 12.18-.867-1.221m7.264-10.246-.867-1.221m-6.988 9.642-1.149-.964m11.49-9.642-1.15-.964m-12.685 5.13-1.41-.513m14.095-5.13-1.41-.513" /></svg>${car.transmission}</span>
                    </div>
                    <div class="car-footer">
                        <div class="price">${formattedPrice}₫<span class="unit">/ngày</span></div>
                        <a href="detail.html?id=${car.id}" class="view-details" style="border-radius: 6px; padding: 0.6rem 1rem;">Xem Chi Tiết</a>
                    </div>
                </div>
            </div>
        `;
    }
};

// Auto-initialize components
document.addEventListener('DOMContentLoaded', () => {
    ui.renderNavbar();
    ui.renderFooter();
}); 
