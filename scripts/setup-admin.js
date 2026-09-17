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

async function setupAdmin() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'fresh_ecom'
  });

  console.log('Altering users table to allow ADMIN role...');
  await conn.query("ALTER TABLE users MODIFY COLUMN account_type ENUM('RETAIL', 'HOTEL_WHOLESALE', 'ADMIN') NOT NULL DEFAULT 'RETAIL'");

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('admin123', salt);

  console.log('Inserting or updating Admin account (9999999999)...');
  await conn.query(
    "INSERT INTO users (phone, password_hash, full_name, account_type) VALUES ('9999999999', ?, 'Central Dark Store Admin', 'ADMIN') ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), account_type = 'ADMIN'",
    [hash]
  );

  console.log('✅ Admin account configured successfully!');
  console.log('Phone: 9999999999 | Password: admin123');
  await conn.end();
}

setupAdmin().catch((err) => {
  console.error('Error configuring admin account:', err);
  process.exit(1);
});
