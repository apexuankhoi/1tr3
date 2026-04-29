
const db = require('./config/db');

async function fixUserPots() {
  try {
    console.log('--- Fixing user_pots table ---');
    
    // 1. Remove duplicates, keeping only the most recent one (highest id)
    console.log('1. Removing duplicates...');
    await db.query(`
      DELETE p1 FROM user_pots p1
      INNER JOIN user_pots p2 
      WHERE p1.id < p2.id 
      AND p1.user_id = p2.user_id 
      AND p1.pot_id = p2.pot_id
    `);
    
    // 2. Add UNIQUE constraint
    console.log('2. Adding UNIQUE index on (user_id, pot_id)...');
    try {
      await db.query('ALTER TABLE user_pots ADD UNIQUE INDEX unique_user_pot (user_id, pot_id)');
      console.log('   Index added successfully.');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
          console.error('   Error: Duplicate entries still exist. Manual cleanup needed?');
      } else if (err.code === 'ER_DUP_KEYNAME') {
          console.log('   Index already exists.');
      } else {
          throw err;
      }
    }
    
    console.log('--- Done ---');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing user_pots:', err);
    process.exit(1);
  }
}

fixUserPots();
