import db from "./database";
import Company from "../models/Company";
import Transaction from "../models/Transaction";

export const insertTransaction = (
  companyId: number,
  type: string,
  shareCount: number | null,
  pricePerShare: number | null,
  handlingFee: number | null,
  grossAmount: number,
  netAmount: number,
  transactionDate: string,
  transactionTime: string,
) => {
  try {
    db.execSync("BEGIN TRANSACTION");

    db.runSync(
      `
      INSERT INTO transactions (
        company_id,
        type,
        share_count,
        price_per_share,
        handling_fee,
        gross_amount,
        net_amount,
        transaction_date,
        transaction_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        companyId,
        type,
        shareCount,
        pricePerShare,
        handlingFee,
        grossAmount,
        netAmount,
        transactionDate,
        transactionTime,
      ],
    );

    db.execSync("COMMIT");
  } catch (error) {
    db.execSync("ROLLBACK");
    throw error;
  }
};

type TransactionRow = {
  id: number;
  type: string;
  share_count: number;
  price_per_share: number;
  handling_fee: number;
  gross_amount: number;
  net_amount: number;
  transaction_date: string;
  transaction_time: string;
  notes: string | null;
  company_id: number;
  company_name: string;
  company_code: string;
};

export const getTransactions = (
  dateFrom: string | null = null,
  dateTo: string | null = null,
  companyId: number | null = null,
) => {
  let query = `
    SELECT
      t.id,
      t.type,
      t.share_count,
      t.price_per_share,
      t.handling_fee,
      t.gross_amount,
      t.net_amount,
      t.transaction_date,
      t.transaction_time,
      t.notes,
      c.id as company_id,
      c.name as company_name,
      c.code as company_code
    FROM transactions t
    JOIN companies c
      ON t.company_id = c.id
    WHERE 1=1
  `;

  const params = [];

  if (companyId !== null) {
    query += ` AND t.company_id = ?`;
    params.push(companyId);
  }

  if (dateFrom !== null) {
    query += ` AND t.transaction_date >= ?`;
    params.push(dateFrom);
  }

  if (dateTo !== null) {
    query += ` AND t.transaction_date <= ?`;
    params.push(dateTo);
  }

  query += `
    ORDER BY
      t.transaction_date DESC,
      t.transaction_time DESC
  `;

  const rows = db.getAllSync(query, params) as TransactionRow[];

  return rows.map((row) => {
    const company = new Company(
      row.company_id,
      row.company_name,
      row.company_code,
    );

    return new Transaction(
      row.id,
      company,
      row.type,
      row.share_count,
      row.price_per_share,
      row.handling_fee,
      row.gross_amount,
      row.net_amount,
      row.transaction_date,
      row.transaction_time,
      row.notes,
    );
  });
};

export const deleteTransactionById = (id: number) => {
  return db.runSync(
    `
    DELETE FROM transactions
    WHERE id = ?
    `,
    [id],
  );
};
