const API_URL = 'http://localhost:5000/api';
// const API_URL = "http://192.168.1.232:5000/api";

const api = {
    async getCars(params = {}) {
        let url = new URL(`${API_URL}/cars`);
        Object.keys(params).forEach(key => {
            if (params[key]) {
                url.searchParams.append(key, params[key]);
            }
        });
        const res = await fetch(url);
        return res.json();
    },

    async getCarDetails(id) {
        const res = await fetch(`${API_URL}/cars/${id}`);
        if (!res.ok) throw new Error('Failed to fetch car details');
        return res.json();
    },

    async createBooking(bookingData) {
        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to create booking');
        }
        return res.json();
    }
};
