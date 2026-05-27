import Summary from "../models/Summary";
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

export const getSummery = (): Summary => {
  const invRow = db.getFirstSync(`
    SELECT COALESCE(SUM(total_cost), 0) as totalInv
    FROM shares
  `) as { totalInv: number };

  const totalInv = invRow.totalInv;

  const marketRows = db.getAllSync(`
    SELECT 
      s.company_id,
      s.amount_of_shares,
      COALESCE(mp.price, 0) as price
    FROM shares s
    LEFT JOIN market_prices mp 
      ON mp.company_id = s.company_id
    WHERE mp.id IN (
      SELECT MAX(id)
      FROM market_prices
      GROUP BY company_id
    )
  `) as {
    company_id: number;
    amount_of_shares: number;
    price: number;
  }[];

  let marketVal = 0;

  marketRows.forEach((row) => {
    marketVal += row.amount_of_shares * row.price;
  });

  const divRow = db.getFirstSync(`
    SELECT COALESCE(SUM(net_amount), 0) as dividends
    FROM transactions
    WHERE type = 'DIVIDEND'
  `) as { dividends: number };

  const dividends = divRow.dividends;

  const countRow = db.getFirstSync(`
    SELECT COUNT(*) as companyCount
    FROM shares
  `) as { companyCount: number };

  const companyCount = countRow.companyCount;

  const gainRow = db.getFirstSync(`
    SELECT COALESCE(SUM(realized_gain), 0) as realizedGains
    FROM transactions
    WHERE type = 'SELL'
  `) as { realizedGains: number };

  const realizedGains = gainRow.realizedGains;

  return new Summary(
    totalInv,
    marketVal,
    dividends,
    companyCount,
    realizedGains,
  );
};
