
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSql() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  const sql = fs.readFileSync(path.join(__dirname, 'database_full_v2.sql'), 'utf8');
  
  try {
    console.log('Running SQL script...');
    await conn.query(sql);
    console.log('SQL script executed successfully.');
    
    // Also add the UNIQUE constraint that was missing in the file if needed
    console.log('Adding UNIQUE constraint to user_pots...');
    await conn.query('ALTER TABLE user_pots ADD UNIQUE INDEX unique_user_pot (user_id, pot_id)');
    console.log('Constraint added.');
    
    process.exit(0);
  } catch (err) {
    console.error('Error running SQL:', err);
    process.exit(1);
  }
}

runSql();
