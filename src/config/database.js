// Configuration SQLite
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const DB_PATH = path.join(__dirname, '../../eshop.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erreur connexion BDD:', err.message);
  } else {
    console.log('Connecté à SQLite');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    // Table users — mots de passe en clair pour démonstration
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      email    TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT,
      role     TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Table products
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      description TEXT,
      price       REAL NOT NULL,
      stock       INTEGER DEFAULT 0
    )`);

    // Table orders
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity   INTEGER NOT NULL,
      price      REAL NOT NULL,
      total      REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Table comments
    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      content  TEXT NOT NULL
    )`);

    // Données de test
    db.run(`INSERT OR IGNORE INTO users (email, password, role)
            VALUES ('admin@eshop.com', 'admin123', 'admin')`);
    db.run(`INSERT OR IGNORE INTO users (email, password, role)
            VALUES ('user@eshop.com', 'password123', 'customer')`);
    db.run(`INSERT OR IGNORE INTO products (name, description, price, stock)
            VALUES ('Laptop Pro', 'Ordinateur portable haute performance', 850000, 10)`);
    db.run(`INSERT OR IGNORE INTO products (name, description, price, stock)
            VALUES ('Smartphone X', 'Téléphone dernière génération', 450000, 25)`);
  });
}

module.exports = db;
