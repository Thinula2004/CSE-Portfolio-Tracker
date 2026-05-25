import db from "./database";

export const resetDatabase = () => {
  try {
    db.execSync(`
      BEGIN TRANSACTION;

      DELETE FROM transactions;
      DELETE FROM shares;
      DELETE FROM market_prices;
      DELETE FROM companies;

      DELETE FROM sqlite_sequence
      WHERE name IN (
        'transactions',
        'shares',
        'market_prices',
        'companies'
      );

      COMMIT;
    `);

    console.log("Database reset successfully");
  } catch (error) {
    db.execSync("ROLLBACK");
    console.log(error);
  }
};