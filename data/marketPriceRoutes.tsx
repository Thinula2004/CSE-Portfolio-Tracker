import Company from "../models/Company";
import MarketPrice from "../models/MarketPrice";
import db from "./database";

export const insertMarketPrice = (companyId: number, price: number): void => {
  if (price <= 0) {
    throw new Error("Price must be greater than 0");
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  db.runSync(
    `
    INSERT INTO market_prices (
      company_id,
      price,
      updated_at
    )
    VALUES (?, ?, ?)
    `,
    [companyId, price, today],
  );

  const result = db.getAllSync(`
    SELECT * FROM market_prices ORDER BY id DESC
  `);

  console.log("market_prices table:");
  console.log(result);
};

type MarketRowFetch = {
  id: number;
  price: number;
  updated_at: string;
  company_id: number;
  company_name: string;
  company_code: string;
};

export const getMarketPrices = (companyId: number) => {
  const query = `
    SELECT
      m.id,
      m.price,
      m.updated_at,
      c.id as company_id,
      c.name as company_name,
      c.code as company_code
    FROM market_prices m
    JOIN companies c
      ON m.company_id = c.id
    WHERE c.id = ?
    ORDER BY m.updated_at ASC
  `;

  const rows = db.getAllSync(query, [companyId]) as MarketRowFetch[];

  return rows.map((row) => {
    const company = new Company(
      row.company_id,
      row.company_name,
      row.company_code,
    );

    return new MarketPrice(row.id, company, row.price, row.updated_at);
  });
};

export const resetMarketPrices = (): void => {
  db.runSync(`
    DELETE from market_prices
    `);

  const result = db.getAllSync(`
    SELECT * FROM market_prices ORDER BY id DESC
  `);

  console.log("market_prices table:");
  console.log(result);
};

export const demoInsert = (): void => {
  const companyId = 3;

  const basePrice = 200;

  for (let i = 9; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const formattedDate = date.toISOString().split("T")[0];

    // simple demo fluctuation
    const price = basePrice + Math.floor(Math.random() * 40 - 20);

    db.runSync(
      `
      INSERT INTO market_prices (
        company_id,
        price,
        updated_at
      )
      VALUES (?, ?, ?)
      `,
      [companyId, price, formattedDate],
    );
  }

  const result = db.getAllSync(`
    SELECT * FROM market_prices ORDER BY updated_at ASC
  `);

  console.log("📊 Demo market_prices inserted:");
  console.log(result);
};
