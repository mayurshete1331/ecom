const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read .env.local
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

async function migrateMultiStore() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'fresh_ecom'
  });

  console.log('Connecting to MySQL and applying Multi-Store / Multi-Admin schema...');

  // 1. Create stores table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_user_id INT NOT NULL,
      store_name VARCHAR(150) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      phone VARCHAR(20) NOT NULL,
      city VARCHAR(100) DEFAULT 'Pune',
      pincode VARCHAR(15) DEFAULT '411045',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_admin_user (admin_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2. Add store_id to products table if not present
  const [prodCols] = await conn.query("SHOW COLUMNS FROM products LIKE 'store_id'");
  if (prodCols.length === 0) {
    console.log("Adding 'store_id' column to products table...");
    await conn.query("ALTER TABLE products ADD COLUMN store_id INT NOT NULL DEFAULT 1 AFTER category_id");
    await conn.query("ALTER TABLE products ADD INDEX idx_store (store_id)");
  }

  // 3. Add store_id to orders table if not present
  const [orderCols] = await conn.query("SHOW COLUMNS FROM orders LIKE 'store_id'");
  if (orderCols.length === 0) {
    console.log("Adding 'store_id' column to orders table...");
    await conn.query("ALTER TABLE orders ADD COLUMN store_id INT NOT NULL DEFAULT 1 AFTER user_id");
    await conn.query("ALTER TABLE orders ADD INDEX idx_order_store (store_id)");
  }

  // 4. Ensure Store 1 exists for primary admin (9999999999)
  const [admin1] = await conn.query("SELECT id FROM users WHERE phone = '9999999999'");
  let admin1Id = admin1[0]?.id;

  if (admin1Id) {
    await conn.query(`
      INSERT INTO stores (id, admin_user_id, store_name, slug, description, phone, city, pincode)
      VALUES (1, ?, 'KisanDirect Central Farm & Sprouts', 'central-farm-sprouts', 'Primary dark store specializing in freshly sprouted pulses, crisp broccoli, and farm malai paneer.', '9999999999', 'Pune', '411045')
      ON DUPLICATE KEY UPDATE store_name = VALUES(store_name)
    `, [admin1Id]);
    console.log('✅ Store 1 (KisanDirect Central Farm & Sprouts) configured for Admin 1 (9999999999).');
  }

  // 5. Seed Store 2 for second admin (Brother / Partner Supplier)
  const salt = await bcrypt.genSalt(10);
  const commonPassHash = await bcrypt.hash('admin123', salt);

  const [admin2Res] = await conn.query(`
    INSERT INTO users (phone, password_hash, full_name, account_type)
    VALUES ('8888888888', ?, 'Kailash Patil (Brothers Agro)', 'ADMIN')
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), account_type = 'ADMIN'
  `, [commonPassHash]);

  const [admin2User] = await conn.query("SELECT id FROM users WHERE phone = '8888888888'");
  const admin2Id = admin2User[0].id;

  await conn.query(`
    INSERT INTO stores (id, admin_user_id, store_name, slug, description, phone, city, pincode)
    VALUES (2, ?, 'Brothers Green Harvest & Hydroponics', 'brothers-green-harvest', 'Specialist dark store for premium hydroponic greens, baby spinach, tender sweet corn, and exotic kitchen herbs.', '8888888888', 'Pune', '411057')
    ON DUPLICATE KEY UPDATE store_name = VALUES(store_name)
  `, [admin2Id]);
  console.log('✅ Store 2 (Brothers Green Harvest & Hydroponics) configured for Admin 2 (8888888888).');

  // 6. Seed unique products for Store 2 if not already present
  const [existingStore2Prod] = await conn.query("SELECT id FROM products WHERE store_id = 2");
  if (existingStore2Prod.length === 0) {
    console.log("Seeding Store 2 exclusive produce items...");

    // Find category IDs
    const [cats] = await conn.query("SELECT id, slug FROM categories");
    const catMap = {};
    for (const c of cats) catMap[c.slug] = c.id;

    const exoticCatId = catMap['exotic-veggies'] || 2;
    const pulsesCatId = catMap['sprouts-pulses'] || 1;

    // Product 1: Hydroponic Baby Spinach
    const [p1] = await conn.query(`
      INSERT INTO products (category_id, store_id, name, slug, description, image_url, badge, is_featured)
      VALUES (?, 2, 'Hydroponic Baby Spinach (Palak)', 'hydroponic-baby-spinach', 'Pesticide-free tender baby spinach leaves grown in purified water. Rinsed and ready-to-eat.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', '🌱 Hydroponic Pure', true)
    `, [exoticCatId]);
    const p1Id = p1.insertId;

    // Tiers for Spinach
    await conn.query(`
      INSERT INTO product_tiers (product_id, tier_type, unit_size, price, mrp, stock_quantity, min_order_qty)
      VALUES 
        (?, 'RETAIL', '200g Box', 40.00, 55.00, 150, 1),
        (?, 'RETAIL', '500g Pack', 85.00, 120.00, 100, 1),
        (?, 'WHOLESALE', '3kg Crate', 450.00, 600.00, 30, 1),
        (?, 'WHOLESALE', '5kg Commercial Crate', 700.00, 950.00, 20, 1)
    `, [p1Id, p1Id, p1Id, p1Id]);

    // Product 2: Farm Fresh Sweet American Corn
    const [p2] = await conn.query(`
      INSERT INTO products (category_id, store_id, name, slug, description, image_url, badge, is_featured)
      VALUES (?, 2, 'Tender American Sweet Corn', 'tender-american-sweet-corn', 'Plump golden sweet corn kernels on cob. Extra juicy with high natural sweetness.', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80', '🌽 Super Sweet', true)
    `, [exoticCatId]);
    const p2Id = p2.insertId;

    await conn.query(`
      INSERT INTO product_tiers (product_id, tier_type, unit_size, price, mrp, stock_quantity, min_order_qty)
      VALUES 
        (?, 'RETAIL', '2 Cobs Pack', 35.00, 45.00, 200, 1),
        (?, 'RETAIL', '4 Cobs Family Pack', 65.00, 85.00, 180, 1),
        (?, 'WHOLESALE', '25 Cobs Bulk Box', 350.00, 480.00, 40, 1),
        (?, 'WHOLESALE', '50 Cobs Commercial Crate', 650.00, 900.00, 25, 1)
    `, [p2Id, p2Id, p2Id, p2Id]);

    // Seed a sample order placed with Store 2 by the Hotel Account
    const [hotelUser] = await conn.query("SELECT id FROM users WHERE phone = '9123456780'");
    const hotelUserId = hotelUser[0]?.id || 2;

    const [s2Order] = await conn.query(`
      INSERT INTO orders (order_number, user_id, store_id, account_type, status, payment_mode, payment_status, subtotal, delivery_fee, tax_gst, total_amount, delivery_address, delivery_notes)
      VALUES ('FD-STORE2-7821', ?, 2, 'HOTEL_WHOLESALE', 'PLACED', 'COD', 'PENDING_ON_DELIVERY', 700.00, 0.00, 35.00, 735.00, 'Plot 45, Phase 1, Hinjewadi IT Park, Main Commercial Kitchen Dock B, Pune', 'Deliver to Chef Rajesh at rear dock before 7:00 AM')
    `, [hotelUserId]);

    await conn.query(`
      INSERT INTO order_items (order_id, product_id, tier_id, product_name_snapshot, unit_size_snapshot, unit_price, quantity, total_price)
      VALUES (?, ?, ?, 'Hydroponic Baby Spinach (Palak)', '5kg Commercial Crate', 700.00, 1, 700.00)
    `, [s2Order.insertId, p1Id, p1Id]);

    console.log('✅ Store 2 exclusive products and sample order created.');
  }

  console.log('================================================================');
  console.log('🎉 Multi-Store & Multi-Admin Migration Complete!');
  console.log('Store 1 (Central Farm & Sprouts): Admin Phone: 9999999999 | Password: admin123');
  console.log('Store 2 (Brothers Green Harvest): Admin Phone: 8888888888 | Password: admin123');
  console.log('================================================================');

  await conn.end();
}

migrateMultiStore().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
