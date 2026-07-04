require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('./db');

const vehicles = [
  {
    id: uuidv4(),
    name: 'Luxury Sedan',
    description: 'Elegant design with advanced technology and exceptional comfort.',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=900&q=80',
    category: 'sedan',
    featured: 1
  },
  {
    id: uuidv4(),
    name: 'Sports Coupe',
    description: 'High performance engineered for speed and precision.',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
    category: 'coupe',
    featured: 1
  },
  {
    id: uuidv4(),
    name: 'Premium SUV',
    description: 'Powerful, spacious, and built for every adventure.',
    price: 58000,
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80',
    category: 'suv',
    featured: 1
  },
  {
    id: uuidv4(),
    name: 'Electric Performance',
    description: 'Zero emissions meets breathtaking acceleration.',
    price: 72000,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
    category: 'electric',
    featured: 1
  },
  {
    id: uuidv4(),
    name: 'Convertible Roadster',
    description: 'Open-top thrills with refined luxury craftsmanship.',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80',
    category: 'convertible',
    featured: 0
  },
  {
    id: uuidv4(),
    name: 'Luxury Tourer',
    description: 'Long-distance comfort wrapped in sophisticated design.',
    price: 82000,
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=900&q=80',
    category: 'sedan',
    featured: 0
  }
];

const db = getDb();

const existing = db.prepare('SELECT COUNT(*) as count FROM vehicles').get();
if (existing.count > 0) {
  console.log('Database already seeded (%d vehicles).', existing.count);
  process.exit(0);
}

const insert = db.prepare(
  'INSERT INTO vehicles (id, name, description, price, image, category, featured) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

const tx = db.transaction(() => {
  for (const v of vehicles) {
    insert.run(v.id, v.name, v.description, v.price, v.image, v.category, v.featured);
  }
});

tx();
console.log('Seeded %d vehicles.', vehicles.length);
process.exit(0);
