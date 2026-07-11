require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create admin user (password: admin123)
    const adminHash = await bcrypt.hash('admin123', 12);
    await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
      ['admin@drivex.com', adminHash, 'Admin', 'User', 'admin']
    );

    // Create demo customer (password: customer123)
    const custHash = await bcrypt.hash('customer123', 12);
    await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
      ['customer@example.com', custHash, 'John', 'Doe', 'customer']
    );

    // Create categories
    const categories = ['Sedan', 'SUV', 'Coupe', 'Convertible', 'Truck', 'Electric', 'Luxury'];
    for (const name of categories) {
      const slug = name.toLowerCase();
      await client.query('INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [name, slug]);
    }

    // Get category IDs
    const catResult = await client.query('SELECT id, slug FROM categories');
    const catMap = {};
    catResult.rows.forEach(r => catMap[r.slug] = r.id);

    // Seed vehicles
    const vehicles = [
      { title: '2024 BMW M4 Competition', desc: 'Experience pure driving pleasure with this stunning BMW M4 Competition. Twin-turbo inline-6 delivers 503hp.', make: 'BMW', model: 'M4 Competition', year: 2024, price: 82900, mileage: 1200, ext: 'Isle of Man Green', int: 'Black', trans: 'automatic', fuel: 'gasoline', engine: '3.0L Twin-Turbo I6', drive: 'rwd', vin: 'WBA5R1C07NFD12345', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', cat: 'coupe', cond: 'new', feat: true },
      { title: '2023 Mercedes-Benz GLE 450', desc: 'Luxury meets performance in this fully loaded GLE 450. AMG Line package with premium interior.', make: 'Mercedes-Benz', model: 'GLE 450', year: 2023, price: 67500, mileage: 8500, ext: 'Obsidian Black', int: 'Macchiato Beige', trans: 'automatic', fuel: 'gasoline', engine: '3.0L Turbo I6', drive: 'awd', vin: 'WDCFF8JB2NF123456', img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800', cat: 'suv', cond: 'used', feat: true },
      { title: '2024 Tesla Model S Plaid', desc: 'The quickest production car ever. 0-60 in under 2 seconds. Tri-motor AWD with 396mi range.', make: 'Tesla', model: 'Model S Plaid', year: 2024, price: 89990, mileage: 500, ext: 'Midnight Silver', int: 'White', trans: 'automatic', fuel: 'electric', engine: 'Tri-Motor Electric', drive: 'awd', vin: '5YJ3E1EA9PF123456', img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800', cat: 'electric', cond: 'new', feat: true },
      { title: '2022 Porsche 911 Carrera S', desc: 'Iconic sports car with flat-6 engine. PDK transmission, Sport Chrono package, pristine condition.', make: 'Porsche', model: '911 Carrera S', year: 2022, price: 125000, mileage: 12000, ext: 'GT Silver', int: 'Black Leather', trans: 'automatic', fuel: 'gasoline', engine: '3.0L Twin-Turbo Flat-6', drive: 'rwd', vin: 'WP0AB2A91NS123456', img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800', cat: 'coupe', cond: 'used', feat: true },
      { title: '2024 Ford Bronco Raptor', desc: 'Built Wild. 3.0L EcoBoost V6, 418hp, HOSS 4.0 suspension, 37-inch tires.', make: 'Ford', model: 'Bronco Raptor', year: 2024, price: 78500, mileage: 2000, ext: 'Code Orange', int: 'Black', trans: 'automatic', fuel: 'gasoline', engine: '3.0L EcoBoost V6', drive: '4wd', vin: '1FMEE5EP8RFA12345', img: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800', cat: 'suv', cond: 'new', feat: false },
      { title: '2021 Audi RS7 Sportback', desc: 'Rocket sedan with 591hp twin-turbo V8. Executive package, Bang & Olufsen audio.', make: 'Audi', model: 'RS7 Sportback', year: 2021, price: 95000, mileage: 22000, ext: 'Nardo Gray', int: 'Black Valcona', trans: 'automatic', fuel: 'gasoline', engine: '4.0L Twin-Turbo V8', drive: 'awd', vin: 'WAUZZZ4K1PD123456', img: 'https://images.unsplash.com/photo-1606611013016-969c19ba27c5?w=800', cat: 'sedan', cond: 'used', feat: false },
      { title: '2024 Chevrolet Corvette Z06', desc: 'Mid-engine American supercar. 5.5L flat-plane crank V8, 670hp. Z51 performance package.', make: 'Chevrolet', model: 'Corvette Z06', year: 2024, price: 115000, mileage: 800, ext: 'Torch Red', int: 'Jet Black', trans: 'automatic', fuel: 'gasoline', engine: '5.5L V8 Flat-Plane', drive: 'rwd', vin: '1G1Y82D47R5123456', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', cat: 'coupe', cond: 'new', feat: true },
      { title: '2023 Range Rover Autobiography', desc: 'The pinnacle of luxury SUVs. 4.4L V8, executive seating, panoramic roof, Terrain Response 2.', make: 'Land Rover', model: 'Range Rover', year: 2023, price: 135000, mileage: 15000, ext: 'Constellation Grey', int: 'Tan Semi-Aniline', trans: 'automatic', fuel: 'gasoline', engine: '4.4L Twin-Turbo V8', drive: 'awd', vin: 'SALWA2BK6PA123456', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800', cat: 'suv', cond: 'certified', feat: true },
      { title: '2024 Lexus LC 500', desc: 'Grand touring perfection. 5.0L naturally aspirated V8, 10-speed automatic, stunning design.', make: 'Lexus', model: 'LC 500', year: 2024, price: 98000, mileage: 3000, ext: 'Circuit Red', int: 'Black Alcantara', trans: 'automatic', fuel: 'gasoline', engine: '5.0L V8', drive: 'rwd', vin: 'JTHHP5BA4PA123456', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800', cat: 'sedan', cond: 'new', feat: false },
      { title: '2023 Toyota GR Supra 3.0', desc: 'Co-developed with BMW. Turbo inline-6, 382hp, rear-wheel drive, perfect balance.', make: 'Toyota', model: 'GR Supra', year: 2023, price: 56000, mileage: 9000, ext: 'Phantom', int: 'Black', trans: 'automatic', fuel: 'gasoline', engine: '3.0L Turbo I6', drive: 'rwd', vin: 'JTKPY1AX7P1234567', img: 'https://images.unsplash.com/photo-1626668895804-a3a4076c4b78?w=800', cat: 'coupe', cond: 'used', feat: false },
    ];

    for (const v of vehicles) {
      await client.query(
        `INSERT INTO vehicles (title, description, make, model, year, price, mileage, exterior_color, interior_color, transmission, fuel_type, engine, drivetrain, vin, image_url, category_id, condition, featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) ON CONFLICT (vin) DO NOTHING`,
        [v.title, v.desc, v.make, v.model, v.year, v.price, v.mileage, v.ext, v.int, v.trans, v.fuel, v.engine, v.drive, v.vin, v.img, catMap[v.cat], v.cond, v.feat]
      );
    }

    await client.query('COMMIT');
    console.log('Seed complete! Users: admin@drivex.com/admin123, customer@example.com/customer123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
