-- DriveX Motors Seed Data

INSERT INTO categories (name, slug) VALUES
    ('Sedan', 'sedan'),
    ('SUV', 'suv'),
    ('Coupe', 'coupe'),
    ('Convertible', 'convertible'),
    ('Truck', 'truck'),
    ('Electric', 'electric'),
    ('Luxury', 'luxury');

-- Admin user (password: admin123)
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@drivex.com', '$2b$10$rOzPXx0y8k8q8q8q8q8q8uQxQxQxQxQxQxQxQxQxQxQxQxQxQxQx', 'Admin', 'User', 'admin');

-- Demo customer (password: customer123)
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'customer@example.com', '$2b$10$rOzPXx0y8k8q8q8q8q8q8uQxQxQxQxQxQxQxQxQxQxQxQxQxQxQx', 'John', 'Doe', 'customer');

-- Vehicles
INSERT INTO vehicles (id, title, description, make, model, year, price, mileage, exterior_color, interior_color, transmission, fuel_type, engine, drivetrain, vin, image_url, category_id, condition, featured, status) VALUES
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', '2024 BMW M4 Competition', 'Experience pure driving pleasure with this stunning BMW M4 Competition. Twin-turbo inline-6 delivers 503hp.', 'BMW', 'M4 Competition', 2024, 82900, 1200, 'Isle of Man Green', 'Black', 'automatic', 'gasoline', '3.0L Twin-Turbo I6', 'rwd', 'WBA5R1C07NFD12345', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 3, 'new', true, 'available'),

    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', '2023 Mercedes-Benz GLE 450', 'Luxury meets performance in this fully loaded GLE 450. AMG Line package with premium interior.', 'Mercedes-Benz', 'GLE 450', 2023, 67500, 8500, 'Obsidian Black', 'Macchiato Beige', 'automatic', 'gasoline', '3.0L Turbo I6', 'awd', 'WDCFF8JB2NF123456', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800', 2, 'used', true, 'available'),

    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '2024 Tesla Model S Plaid', 'The quickest production car ever. 0-60 in under 2 seconds. Tri-motor AWD with 396mi range.', 'Tesla', 'Model S Plaid', 2024, 89990, 500, 'Midnight Silver', 'White', 'automatic', 'electric', 'Tri-Motor Electric', 'awd', '5YJ3E1EA9PF123456', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800', 6, 'new', true, 'available'),

    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', '2022 Porsche 911 Carrera S', 'Iconic sports car with flat-6 engine. PDK transmission, Sport Chrono package, pristine condition.', 'Porsche', '911 Carrera S', 2022, 125000, 12000, 'GT Silver', 'Black Leather', 'automatic', 'gasoline', '3.0L Twin-Turbo Flat-6', 'rwd', 'WP0AB2A91NS123456', 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800', 3, 'used', true, 'available'),

    ('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', '2024 Ford Bronco Raptor', 'Built Wild. 3.0L EcoBoost V6, 418hp, HOSS 4.0 suspension, 37-inch tires.', 'Ford', 'Bronco Raptor', 2024, 78500, 2000, 'Code Orange', 'Black', 'automatic', 'gasoline', '3.0L EcoBoost V6', '4wd', '1FMEE5EP8RFA12345', 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800', 2, 'new', false, 'available'),

    ('11eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', '2021 Audi RS7 Sportback', 'Rocket sedan with 591hp twin-turbo V8. Executive package, Bang & Olufsen audio.', 'Audi', 'RS7 Sportback', 2021, 95000, 22000, 'Nardo Gray', 'Black Valcona', 'automatic', 'gasoline', '4.0L Twin-Turbo V8', 'awd', 'WAUZZZ4K1PD123456', 'https://images.unsplash.com/photo-1606611013016-969c19ba27c5?w=800', 1, 'used', false, 'available'),

    ('12eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', '2024 Chevrolet Corvette Z06', 'Mid-engine American supercar. 5.5L flat-plane crank V8, 670hp. Z51 performance package.', 'Chevrolet', 'Corvette Z06', 2024, 115000, 800, 'Torch Red', 'Jet Black', 'automatic', 'gasoline', '5.5L V8 Flat-Plane', 'rwd', '1G1Y82D47R5123456', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 3, 'new', true, 'available'),

    ('13eebc99-9c0b-4ef8-bb6d-6bb9bd380b00', '2023 Range Rover Autobiography', 'The pinnacle of luxury SUVs. 4.4L V8, executive seating, panoramic roof, Terrain Response 2.', 'Land Rover', 'Range Rover', 2023, 135000, 15000, 'Constellation Grey', 'Tan Semi-Aniline', 'automatic', 'gasoline', '4.4L Twin-Turbo V8', 'awd', 'SALWA2BK6PA123456', 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800', 2, 'certified', true, 'available'),

    ('14eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', '2024 Lexus LC 500', 'Grand touring perfection. 5.0L naturally aspirated V8, 10-speed automatic, stunning design.', 'Lexus', 'LC 500', 2024, 98000, 3000, 'Circuit Red', 'Black Alcantara', 'automatic', 'gasoline', '5.0L V8', 'rwd', 'JTHHP5BA4PA123456', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800', 1, 'new', false, 'available'),

    ('15eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', '2023 Toyota GR Supra 3.0', 'Co-developed with BMW. Turbo inline-6, 382hp, rear-wheel drive, perfect balance.', 'Toyota', 'GR Supra', 2023, 56000, 9000, 'Phantom', 'Black', 'automatic', 'gasoline', '3.0L Turbo I6', 'rwd', 'JTKPY1AX7P1234567', 'https://images.unsplash.com/photo-1626668895804-a3a4076c4b78?w=800', 3, 'used', false, 'available');

-- Sample sell submissions
INSERT INTO sell_submissions (id, user_id, make, model, year, mileage, condition, vin, asking_price, status) VALUES
    ('20eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Honda', 'Civic', 2020, 35000, 'good', '2HGFC2F59LH123456', 22000, 'pending');

-- Sample offer
INSERT INTO offers (id, user_id, vehicle_id, offer_amount, message, status) VALUES
    ('30eebc99-9c0b-4ef8-bb6d-6bb9bd380b44', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 75000, 'Very interested in this M4. Would you consider $75k?', 'pending');
