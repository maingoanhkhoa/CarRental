CREATE TABLE cars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    seats INT NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    image_url TEXT
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    rental_date DATE NOT NULL,
    return_date DATE NOT NULL,
    car_id INT REFERENCES cars(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO cars (name, price_per_day, seats, transmission, fuel_type, image_url) VALUES 
('Tesla Model 3', 85.00, 5, 'Automatic', 'Electric', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Toyota Camry', 45.00, 5, 'Automatic', 'Petrol', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Honda CR-V', 60.00, 5, 'Automatic', 'Petrol', 'https://images.unsplash.com/photo-1568844293986-8d0400ba4705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Ford Mustang', 100.00, 4, 'Manual', 'Petrol', 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('BMW 3 Series', 90.00, 5, 'Automatic', 'Diesel', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Jeep Wrangler', 75.00, 5, 'Manual', 'Petrol', 'https://images.unsplash.com/photo-1533473359331-01f2f0b9f0eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
