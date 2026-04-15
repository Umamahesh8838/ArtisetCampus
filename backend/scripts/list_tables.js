require('dotenv').config();
const mysql = require('mysql2/promise');
async function run(){
  const cfg = { host: process.env.DB_HOST||'localhost', user: process.env.DB_USER||'root', password: process.env.DB_PASSWORD||'', database: process.env.DB_NAME||'campus5' };
  const conn = await mysql.createConnection(cfg);
  try{
    const [rows] = await conn.execute('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME', [cfg.database]);
    console.log('Tables in database', cfg.database);
    for (const r of rows) console.log(' -', r.TABLE_NAME);
  }catch(e){ console.error('Error listing tables:', e); }
  finally{ await conn.end(); }
}
run();
