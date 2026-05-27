import db from './database';

export const initDatabase = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        type TEXT NOT NULL
        CHECK(type IN ('BUY','SELL','DIVIDEND')),
        share_count REAL,
        price_per_share REAL,
        handling_fee REAL NOT NULL DEFAULT 0,
        gross_amount REAL NOT NULL,
        net_amount REAL NOT NULL,
        realized_gain REAL NOT NULL DEFAULT 0,
        transaction_date TEXT NOT NULL,
        transaction_time TEXT NOT NULL,
        notes TEXT,

        FOREIGN KEY (company_id)  
        REFERENCES companies(id)
        ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS market_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        price REAL NOT NULL,
        updated_at TEXT NOT NULL,

        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS shares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL UNIQUE,
        amount_of_shares REAL NOT NULL DEFAULT 0,
        average_cost_per_share REAL NOT NULL DEFAULT 0,
        total_cost REAL NOT NULL DEFAULT 0,

        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
      );
    `);

    console.log('Database initialized');
  } catch (error) {
    console.log(error);
  }
};