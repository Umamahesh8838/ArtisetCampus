require('dotenv').config();
const mysql = require('mysql2/promise');

async function run(){
  const cfg = { host: process.env.DB_HOST||'localhost', user: process.env.DB_USER||'root', password: process.env.DB_PASSWORD||'', database: process.env.DB_NAME||'campus5' };
  const conn = await mysql.createConnection(cfg);
  try{
    const [rows] = await conn.execute('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME', [cfg.database]);
    const existing = new Set(rows.map(r=>r.TABLE_NAME));
    const toCreate = [];
    for (const name of existing) {
      if (name.startsWith('tbl_')){
        const alt = name.replace(/^tbl_/, 'tb_');
        if (!existing.has(alt)) toCreate.push({view: alt, target: name});
      }
    }
    if (toCreate.length === 0) {
      console.log('No compatibility views to create.');
      return;
    }
    for (const v of toCreate){
      const sql = `CREATE OR REPLACE VIEW \`${v.view}\` AS SELECT * FROM \`${v.target}\``;
      try{
        await conn.execute(sql);
        console.log('Created view', v.view, '->', v.target);
      }catch(e){ console.error('Failed to create view', v.view, e.message); }
    }
  }catch(e){ console.error('Error:', e); }
  finally{ await conn.end(); }
}

run();
