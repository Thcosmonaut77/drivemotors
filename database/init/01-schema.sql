-- DriveX Motors Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicle categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    mileage INTEGER DEFAULT 0 CHECK (mileage >= 0),
    exterior_color VARCHAR(50),
    interior_color VARCHAR(50),
    transmission VARCHAR(20) CHECK (transmission IN ('automatic', 'manual')),
    fuel_type VARCHAR(20) CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid')),
    engine VARCHAR(100),
    drivetrain VARCHAR(20) CHECK (drivetrain IN ('fwd', 'rwd', 'awd', '4wd')),
    vin VARCHAR(17) UNIQUE,
    image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    category_id INTEGER REFERENCES categories(id),
    condition VARCHAR(20) DEFAULT 'used' CHECK (condition IN ('new', 'used', 'certified')),
    featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'pending')),
    seller_id UUID REFERENCES users(id),
    is_dealer_inventory BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchases / orders
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'financing', 'completed', 'cancelled')),
    payment_method VARCHAR(50),
    financing_term_months INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sell car submissions
CREATE TABLE sell_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    mileage INTEGER DEFAULT 0,
    condition VARCHAR(20) CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    vin VARCHAR(17),
    asking_price DECIMAL(12,2),
    image_url TEXT,
    additional_info TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    admin_notes TEXT,
    offered_price DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Offers / negotiations
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    offer_amount DECIMAL(12,2) NOT NULL CHECK (offer_amount > 0),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'countered', 'accepted', 'rejected', 'expired')),
    counter_amount DECIMAL(12,2),
    counter_message TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Customer messages / inquiries
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Saved / wishlisted vehicles
CREATE TABLE saved_vehicles (
    user_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, vehicle_id)
);

-- Indexes
CREATE INDEX idx_vehicles_category ON vehicles(category_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_featured ON vehicles(featured);
CREATE INDEX idx_vehicles_make ON vehicles(make);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_offers_vehicle ON offers(vehicle_id);
CREATE INDEX idx_offers_user ON offers(user_id);
CREATE INDEX idx_sell_submissions_user ON sell_submissions(user_id);
CREATE INDEX idx_saved_vehicles_user ON saved_vehicles(user_id);
