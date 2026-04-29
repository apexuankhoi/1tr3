const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'app01'
  });

  try {
    // Update Users
    await conn.query(`
      UPDATE users 
      SET last_lat = 12.6667, last_lng = 108.0500, last_seen = NOW() 
      WHERE id IN (1, 2, 11, 12)
    `);

    // Update Submissions
    await conn.query(`
      UPDATE task_submissions 
      SET image_url = CONCAT(image_url, '|GPS:12.6833,108.0333|ADDR:Khu rẫy cà phê, Buôn Ma Thuột') 
      WHERE id = 1 AND image_url NOT LIKE '%|GPS:%'
    `);
    
    await conn.query(`
      UPDATE task_submissions 
      SET image_url = CONCAT(image_url, '|GPS:12.6500,108.0667|ADDR:Trạm kiểm soát môi trường') 
      WHERE id = 2 AND image_url NOT LIKE '%|GPS:%'
    `);

    console.log("✅ Database app01 updated successfully with Map data.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    process.exit(0);
  }
}

run();
