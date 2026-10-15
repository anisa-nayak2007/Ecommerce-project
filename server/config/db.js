// SQLite3 Database Connection & Promise-wrapped Async Helpers
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const isVercel = Boolean(process.env.VERCEL);
let DB_PATH = path.join(__dirname, '..', '..', 'database.sqlite');

// On Vercel Serverless, the root filesystem is read-only.
// We copy the database to /tmp so write operations (orders, stock updates) succeed.
if (isVercel) {
  const tmpDbPath = path.join('/tmp', 'database.sqlite');
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(DB_PATH)) {
    try {
      fs.copyFileSync(DB_PATH, tmpDbPath);
      console.log('Copied database to /tmp for Vercel serverless execution.');
    } catch (e) {
      console.error('Failed to copy database to /tmp:', e);
    }
  }
  DB_PATH = tmpDbPath;
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite3 database:', err.message);
  } else {
    console.log('Connected to SQLite3 database at:', DB_PATH);
  }
});

// Configure WAL mode and Foreign Keys
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON;');
  db.run('PRAGMA journal_mode = WAL;');
});

// Promise wrappers for async/await
const dbAsync = {
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  exec(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  raw: db
};

module.exports = dbAsync;
