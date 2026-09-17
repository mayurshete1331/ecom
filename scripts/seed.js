const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read environment variables manually if dotenv isn't installed
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  });
}

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  multipleStatements: true
};

const DB_NAME = process.env.DB_NAME || 'fresh_ecom';

async function seed() {
  console.log(`Connecting to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port} as ${DB_CONFIG.user}...`);
  
  let rootConnection;
  try {
    rootConnection = await mysql.createConnection(DB_CONFIG);
  } catch (err) {
    console.error('Failed to connect to MySQL server:', err.message);
    console.error('Please verify MySQL is running and credentials in .env.local are correct.');
    process.exit(1);
  }

  try {
    console.log(`Ensuring database '${DB_NAME}' exists...`);
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConnection.end();

    const dbConnection = await mysql.createConnection({
      ...DB_CONFIG,
      database: DB_NAME
    });

    console.log(`Executing schema DDL from scripts/schema.sql...`);
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await dbConnection.query(schemaSql);
    console.log('Database tables ready.');

    // Check if products already exist
    const [existingProducts] = await dbConnection.query('SELECT COUNT(*) as count FROM products');
    if (existingProducts[0].count > 0) {
      console.log(`Database already has ${existingProducts[0].count} products. Skipping duplicate seed.`);
      await dbConnection.end();
      return;
    }

    console.log('Seeding categories...');
    const categoriesData = [
      { name: 'Fresh Sprouts & Pulses', slug: 'sprouts-pulses', icon_name: 'Sprout', display_order: 1 },
      { name: 'Exotic Greens & Veggies', slug: 'exotic-veggies', icon_name: 'Salad', display_order: 2 },
      { name: 'Dairy & Kitchen Protein', slug: 'dairy-protein', icon_name: 'Milk', display_order: 3 },
      { name: 'Daily Kitchen Staples', slug: 'daily-staples', icon_name: 'Package', display_order: 4 }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const [res] = await dbConnection.query(
        'INSERT INTO categories (name, slug, icon_name, display_order) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [cat.name, cat.slug, cat.icon_name, cat.display_order]
      );
      categoryMap[cat.slug] = res.insertId;
    }

    console.log('Seeding products & pricing tiers (Retail + Hotel Wholesale)...');
    const productsData = [
      {
        category_slug: 'sprouts-pulses',
        name: 'Fresh Matki Sprouts (Moth Beans)',
        slug: 'fresh-matki-sprouts',
        description: 'Hygienically germinated organic Matki sprouts. High protein, tender, crisp texture. Graded for salads, usal, and misal.',
        image_url: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80',
        badge: '⚡ Top Seller',
        is_featured: true,
        tiers: [
          // Retail
          { tier_type: 'RETAIL', unit_size: '250g', price: 35.00, mrp: 45.00, stock: 300, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '500g', price: 65.00, mrp: 85.00, stock: 250, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '1kg', price: 120.00, mrp: 160.00, stock: 150, min_order: 1 },
          // Wholesale
          { tier_type: 'WHOLESALE', unit_size: '5kg Crate', price: 450.00, mrp: 600.00, stock: 50, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '10kg Bag', price: 850.00, mrp: 1150.00, stock: 40, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '25kg Commercial Sack', price: 2000.00, mrp: 2800.00, stock: 20, min_order: 1 }
        ]
      },
      {
        category_slug: 'exotic-veggies',
        name: 'Fresh Crisp Broccoli',
        slug: 'fresh-crisp-broccoli',
        description: 'Farm-fresh emerald green broccoli heads. Dense florets, rich in antioxidants. Pre-chilled to lock crispness and taste.',
        image_url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80',
        badge: '🥦 Farm Fresh',
        is_featured: true,
        tiers: [
          // Retail
          { tier_type: 'RETAIL', unit_size: '250g', price: 45.00, mrp: 60.00, stock: 200, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '500g', price: 85.00, mrp: 115.00, stock: 200, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '1kg', price: 160.00, mrp: 210.00, stock: 120, min_order: 1 },
          // Wholesale
          { tier_type: 'WHOLESALE', unit_size: '5kg Crate', price: 650.00, mrp: 900.00, stock: 40, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '10kg Crate', price: 1200.00, mrp: 1700.00, stock: 30, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '20kg Farm Crate', price: 2200.00, mrp: 3200.00, stock: 15, min_order: 1 }
        ]
      },
      {
        category_slug: 'sprouts-pulses',
        name: 'Kabuli Chhole (Grade-A Chickpeas)',
        slug: 'kabuli-chhole-chickpeas',
        description: 'Selected jumbo white chickpeas. Uniform large size (11-12mm), melts buttery soft upon boiling. Essential for hotel gravies & chhole bhature.',
        image_url: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=600&q=80',
        badge: '🌟 Jumbo Grade',
        is_featured: true,
        tiers: [
          // Retail
          { tier_type: 'RETAIL', unit_size: '500g', price: 75.00, mrp: 95.00, stock: 350, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '1kg', price: 140.00, mrp: 180.00, stock: 300, min_order: 1 },
          // Wholesale
          { tier_type: 'WHOLESALE', unit_size: '5kg Bag', price: 580.00, mrp: 750.00, stock: 60, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '10kg Bag', price: 1100.00, mrp: 1450.00, stock: 45, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '25kg Hotel Sack', price: 2600.00, mrp: 3500.00, stock: 30, min_order: 1 }
        ]
      },
      {
        category_slug: 'sprouts-pulses',
        name: 'Moong Sprouts (Germinated Green Gram)',
        slug: 'moong-sprouts-green-gram',
        description: 'Live active sprouted whole green mung beans. Sweet, crunch-packed and rich in plant enzymes. 100% clean water rinsed.',
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        badge: '🌱 100% Organic',
        is_featured: false,
        tiers: [
          // Retail
          { tier_type: 'RETAIL', unit_size: '250g', price: 30.00, mrp: 40.00, stock: 250, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '500g', price: 55.00, mrp: 75.00, stock: 200, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '1kg', price: 100.00, mrp: 140.00, stock: 150, min_order: 1 },
          // Wholesale
          { tier_type: 'WHOLESALE', unit_size: '5kg Crate', price: 400.00, mrp: 550.00, stock: 40, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '10kg Bag', price: 750.00, mrp: 1050.00, stock: 30, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '25kg Sack', price: 1750.00, mrp: 2500.00, stock: 15, min_order: 1 }
        ]
      },
      {
        category_slug: 'dairy-protein',
        name: 'Fresh Malai Paneer (Dairy Block)',
        slug: 'fresh-malai-paneer',
        description: 'Made from pure whole milk with 52% milk fat. Exceptionally soft, succulent paneer blocks that never turn rubbery.',
        image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
        badge: '🥛 Freshly Made',
        is_featured: true,
        tiers: [
          // Retail
          { tier_type: 'RETAIL', unit_size: '200g', price: 80.00, mrp: 95.00, stock: 150, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '500g', price: 190.00, mrp: 225.00, stock: 120, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '1kg Block', price: 370.00, mrp: 440.00, stock: 80, min_order: 1 },
          // Wholesale
          { tier_type: 'WHOLESALE', unit_size: '5kg Commercial Tub', price: 1650.00, mrp: 2000.00, stock: 25, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '10kg Hotel Tub', price: 3100.00, mrp: 3900.00, stock: 15, min_order: 1 }
        ]
      },
      {
        category_slug: 'exotic-veggies',
        name: 'Fresh Button Mushrooms',
        slug: 'fresh-button-mushrooms',
        description: 'Pristine white closed-cup button mushrooms. Grown in climate-controlled farms. Firm, plump caps ideal for gravies and stir-fries.',
        image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
        badge: '🍄 Farm Harvested',
        is_featured: false,
        tiers: [
          // Retail
          { tier_type: 'RETAIL', unit_size: '200g Punnet', price: 55.00, mrp: 70.00, stock: 180, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '400g (2 Punnets)', price: 105.00, mrp: 135.00, stock: 120, min_order: 1 },
          // Wholesale
          { tier_type: 'WHOLESALE', unit_size: '3kg Bulk Crate', price: 600.00, mrp: 800.00, stock: 30, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '5kg Bulk Crate', price: 950.00, mrp: 1300.00, stock: 20, min_order: 1 }
        ]
      },
      {
        category_slug: 'exotic-veggies',
        name: 'Green Bell Peppers (Shimla Mirch)',
        slug: 'green-bell-peppers',
        description: 'Crisp, thick-walled green capsicum. Vibrant glossy shine with a sweet peppery bite. Sorted and graded.',
        image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
        badge: null,
        is_featured: false,
        tiers: [
          // Retail
          { tier_type: 'RETAIL', unit_size: '250g', price: 25.00, mrp: 35.00, stock: 300, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '500g', price: 45.00, mrp: 65.00, stock: 250, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '1kg', price: 85.00, mrp: 115.00, stock: 180, min_order: 1 },
          // Wholesale
          { tier_type: 'WHOLESALE', unit_size: '5kg Crate', price: 350.00, mrp: 480.00, stock: 40, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '10kg Crate', price: 650.00, mrp: 900.00, stock: 30, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '25kg Crate', price: 1500.00, mrp: 2100.00, stock: 20, min_order: 1 }
        ]
      },
      {
        category_slug: 'daily-staples',
        name: 'Nashik Premium Red Onions',
        slug: 'nashik-red-onions',
        description: 'Famous Nashik medium-large red onions. Dry outer skin, pungent aroma, high dry-matter content for rich hotel gravies.',
        image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
        badge: '🧅 Daily Must-Have',
        is_featured: true,
        tiers: [
          // Retail
          { tier_type: 'RETAIL', unit_size: '1kg Net Bag', price: 35.00, mrp: 45.00, stock: 500, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '2kg Bag', price: 68.00, mrp: 90.00, stock: 400, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '5kg Family Pack', price: 160.00, mrp: 210.00, stock: 250, min_order: 1 },
          // Wholesale
          { tier_type: 'WHOLESALE', unit_size: '10kg Bag', price: 290.00, mrp: 380.00, stock: 80, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '25kg Sack', price: 680.00, mrp: 900.00, stock: 60, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '50kg Gunny Bag', price: 1300.00, mrp: 1750.00, stock: 40, min_order: 1 }
        ]
      },
      {
        category_slug: 'sprouts-pulses',
        name: 'Jammu Special Red Rajma',
        slug: 'jammu-special-red-rajma',
        description: 'Authentic Jammu Chitra Red Kidney Beans. Cooks creamy and flavorful with rich gravy consistency. Essential for hotel menus.',
        image_url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80',
        badge: null,
        is_featured: false,
        tiers: [
          // Retail
          { tier_type: 'RETAIL', unit_size: '500g', price: 85.00, mrp: 110.00, stock: 200, min_order: 1 },
          { tier_type: 'RETAIL', unit_size: '1kg', price: 160.00, mrp: 210.00, stock: 150, min_order: 1 },
          // Wholesale
          { tier_type: 'WHOLESALE', unit_size: '5kg Bag', price: 700.00, mrp: 950.00, stock: 40, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '10kg Bag', price: 1350.00, mrp: 1800.00, stock: 25, min_order: 1 },
          { tier_type: 'WHOLESALE', unit_size: '25kg Sack', price: 3200.00, mrp: 4300.00, stock: 15, min_order: 1 }
        ]
      }
    ];

    for (const prod of productsData) {
      const catId = categoryMap[prod.category_slug];
      const [pRes] = await dbConnection.query(
        'INSERT INTO products (category_id, name, slug, description, image_url, badge, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [catId, prod.name, prod.slug, prod.description, prod.image_url, prod.badge, prod.is_featured]
      );
      const productId = pRes.insertId;

      for (const tier of prod.tiers) {
        await dbConnection.query(
          'INSERT INTO product_tiers (product_id, tier_type, unit_size, price, mrp, stock_quantity, min_order_qty) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [productId, tier.tier_type, tier.unit_size, tier.price, tier.mrp, tier.stock, tier.min_order]
        );
      }
    }

    console.log('Seeding initial test accounts (Retail & Hotel Wholesale)...');
    const salt = await bcrypt.genSalt(10);
    const commonPasswordHash = await bcrypt.hash('password123', salt);

    // 1. Retail Test User
    const [user1] = await dbConnection.query(
      'INSERT INTO users (phone, password_hash, full_name, account_type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name)',
      ['9876543210', commonPasswordHash, 'Pooja Sharma', 'RETAIL']
    );
    const userId1 = user1.insertId || 1;
    await dbConnection.query(
      'INSERT INTO addresses (user_id, address_type, address_line, landmark, city, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId1, 'HOME', 'Flat 402, Green Meadows Apartment, Baner Road', 'Near D-Mart', 'Pune', '411045', true]
    );

    // 2. Hotel / Business Test User
    const [user2] = await dbConnection.query(
      'INSERT INTO users (phone, password_hash, full_name, account_type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name)',
      ['9123456780', commonPasswordHash, 'Chef Rajesh Khanna', 'HOTEL_WHOLESALE']
    );
    const userId2 = user2.insertId || 2;
    await dbConnection.query(
      'INSERT INTO hotel_profiles (user_id, hotel_name, manager_name, gstin, dock_receiving_notes) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE hotel_name=VALUES(hotel_name)',
      [userId2, 'Royal Spice Grand Hotel & Banquet', 'Rajesh Khanna', '27AABCR1234F1Z5', 'Receiving dock B at kitchen rear. Deliver between 6:00 AM - 9:30 AM. Call upon arrival.']
    );
    await dbConnection.query(
      'INSERT INTO addresses (user_id, address_type, address_line, landmark, city, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId2, 'HOTEL_DOCK', 'Plot 45, Phase 1, Hinjewadi IT Park, Main Commercial Kitchen Dock B', 'Behind Tower 3', 'Pune', '411057', true]
    );

    console.log('✅ Database successfully initialized and seeded with zero dummy data!');
    console.log('================================================================');
    console.log('Test Accounts created for instant login:');
    console.log('  1. Retail User: Phone 9876543210 | Password: password123');
    console.log('  2. Hotel Wholesale User: Phone 9123456780 | Password: password123');
    console.log('================================================================');

    await dbConnection.end();
  } catch (error) {
    console.error('Error during database seed:', error);
    process.exit(1);
  }
}

seed();
