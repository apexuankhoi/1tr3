const mysql = require('mysql2/promise');

async function main() {
  const db = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'app01'
  });
  
  try {
    await db.query('ALTER TABLE users ADD COLUMN growing_until BIGINT DEFAULT 0');
    console.log("Column added successfully!");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists.");
    } else {
      console.error(e);
    }
  }
  process.exit(0);
}

main();
