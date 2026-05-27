import Company from "../models/Company";
import MarketPrice from "../models/MarketPrice";
import { getCompanies } from "./companyRoutes";
import db from "./database";
import { EventRegister } from "react-native-event-listeners";

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

    const marketPrice: MarketPrice = new MarketPrice(
      row.id,
      company,
      row.price,
      row.updated_at,
    );
    return marketPrice;
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

export const updateCurrentMarketPrices = async (): Promise<void> => {
  const companies = getCompanies();
  const today = new Date().toISOString().split("T")[0];

  for (const company of companies) {
    try {
      const formData = new FormData();
      formData.append("symbol", company.code);

      const response = await fetch(
        "https://www.cse.lk/api/companyInfoSummery",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        console.log(`❌ Failed for ${company.code}`);
        continue;
      }

      const data = await response.json();

      const symbolInfo = data?.reqSymbolInfo;

      if (!symbolInfo) {
        console.log(`❌ No symbol info for ${company.code}`);
        continue;
      }

      const price = symbolInfo.lastTradedPrice ?? symbolInfo.previousClose;

      if (!price || price <= 0) {
        console.log(`❌ Invalid price for ${company.code}`);
        continue;
      }

      const existing = db.getFirstSync(
        `
        SELECT id
        FROM market_prices
        WHERE company_id = ?
          AND updated_at = ?
        `,
        [company.id, today],
      );

      if (existing) {
        db.runSync(
          `
          UPDATE market_prices
          SET price = ?
          WHERE company_id = ?
            AND updated_at = ?
          `,
          [price, company.id, today],
        );

        console.log(`🔄 Updated ${company.code}: ${price}`);
      } else {
        db.runSync(
          `
          INSERT INTO market_prices (
            company_id,
            price,
            updated_at
          )
          VALUES (?, ?, ?)
          `,
          [company.id, price, today],
        );

        console.log(`✅ Inserted ${company.code}: ${price}`);
      }
    } catch (error) {
      console.log(`❌ Error updating ${company.code}`, error);
    }
  }

  EventRegister.emit("marketPricesUpdated");

  const result = db.getAllSync(`
    SELECT *
    FROM market_prices
    ORDER BY updated_at DESC
  `);

  console.log("market_prices updated:");
  console.log(result);
};
