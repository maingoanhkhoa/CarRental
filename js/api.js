/**
 * api.js - Static frontend data provider & Google Sheets integration
 * Runs entirely in the browser without any backend server.
 */

const api = {
    // 🔗 URL Google Apps Script Web App (Dán URL vào đây sau khi bạn tạo và triển khai Google Apps Script)
    GOOGLE_SHEET_REVIEWS_URL: 'https://script.google.com/macros/s/AKfycbzVrFwwSUSv4Htmth2seuUCUXAOW5ObHgkdmNsUsMYh1qjjYOpMeztYk-xhrTNE8N5h/exec',

    /**
     * Lấy danh sách xe (hỗ trợ lọc theo số chỗ)
     */
    async getCars(params = {}) {
        let cars = Array.isArray(window.CARS) ? [...window.CARS] : [];

        if (params.seats) {
            cars = cars.filter(c => String(c.seats) === String(params.seats));
        }

        return cars;
    },

    /**
     * Lấy thông tin chi tiết của xe theo ID
     */
    async getCarDetails(id) {
        const cars = Array.isArray(window.CARS) ? window.CARS : [];
        const car = cars.find(item => String(item.id) === String(id));

        if (!car) {
            throw new Error('Không tìm thấy thông tin xe');
        }

        return car;
    },

    /**
     * Lưu thông tin đặt xe vào localStorage
     */
    async createBooking(bookingData) {
        try {
            const bookings = JSON.parse(localStorage.getItem('vudamsen_bookings') || '[]');
            const newBooking = {
                id: Date.now(),
                ...bookingData,
                created_at: new Date().toISOString()
            };
            bookings.unshift(newBooking);
            localStorage.setItem('vudamsen_bookings', JSON.stringify(bookings));
            return newBooking;
        } catch (err) {
            console.warn('LocalStorage error:', err);
            return {
                id: Date.now(),
                ...bookingData,
                created_at: new Date().toISOString()
            };
        }
    },

    /**
     * Lấy danh sách đánh giá từ Google Sheets (nếu có URL) hoặc từ static data + localStorage
     */
    async getReviews() {
        // 1. Nếu có Google Sheet URL, ưu tiên lấy dữ liệu trực tiếp từ Google Sheets
        if (this.GOOGLE_SHEET_REVIEWS_URL && this.GOOGLE_SHEET_REVIEWS_URL.trim() !== '') {
            try {
                const res = await fetch(this.GOOGLE_SHEET_REVIEWS_URL);
                if (res.ok) {
                    const sheetReviews = await res.json();
                    if (Array.isArray(sheetReviews) && sheetReviews.length > 0) {
                        return sheetReviews;
                    }
                }
            } catch (err) {
                console.warn('Không thể kết nối Google Sheets, tự động chuyển về dữ liệu tĩnh dự phòng:', err);
            }
        }

        // 2. Dự phòng (Fallback): Lấy từ localStorage + window.REVIEWS
        let userReviews = [];
        try {
            userReviews = JSON.parse(localStorage.getItem('vudamsen_user_reviews') || '[]');
        } catch (e) {
            userReviews = [];
        }
        const defaultReviews = Array.isArray(window.REVIEWS) ? window.REVIEWS : [];
        return [...userReviews, ...defaultReviews];
    },

    /**
     * Thêm đánh giá mới: gửi về Google Sheets (nếu có URL) và lưu vào localStorage
     */
    async createReview(reviewData) {
        const newReview = {
            id: Date.now(),
            name: reviewData.name,
            comment: reviewData.comment,
            rating: Math.min(5, Math.max(1, parseInt(reviewData.rating) || 5)),
            created_at: new Date().toISOString()
        };

        // 1. Gửi trực tiếp lên Google Sheets (nếu đã cấu hình URL)
        if (this.GOOGLE_SHEET_REVIEWS_URL && this.GOOGLE_SHEET_REVIEWS_URL.trim() !== '') {
            try {
                // Dùng text/plain để trình duyệt không kích hoạt preflight OPTIONS CORS
                await fetch(this.GOOGLE_SHEET_REVIEWS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(newReview)
                });
            } catch (err) {
                console.warn('Gửi lên Google Sheets lỗi, lưu tạm trên trình duyệt:', err);
            }
        }

        // 2. Luôn lưu vào localStorage để hiển thị tức thì trên máy người gửi
        try {
            const userReviews = JSON.parse(localStorage.getItem('vudamsen_user_reviews') || '[]');
            userReviews.unshift(newReview);
            localStorage.setItem('vudamsen_user_reviews', JSON.stringify(userReviews));
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }

        return newReview;
    }
};
