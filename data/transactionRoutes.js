import db from '../data/database';

export const insertTransaction = (
  companyId,
  type,
  shareCount,
  pricePerShare,
  handlingFee,
  grossAmount,
  netAmount,
  transactionDate
) => {
  return db.runSync(
    `
    INSERT INTO transactions (
      company_id,
      type,
      share_count,
      price_per_share,
      handling_fee,
      gross_amount,
      net_amount,
      transaction_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      companyId,
      type,
      shareCount,
      pricePerShare,
      handlingFee,
      grossAmount,
      netAmount,
      transactionDate
    ]
  );
};

export const getTransactions = () => {
  return db.getAllSync(`
    SELECT
      t.id,
      t.type,
      t.share_count,
      t.price_per_share,
      t.handling_fee,
      t.gross_amount,
      t.net_amount,
      t.transaction_date,
      c.name as company_name,
      c.code as company_code
    FROM transactions t
    JOIN companies c
      ON t.company_id = c.id
    ORDER BY t.transaction_date DESC
  `);
};

export const deleteTransactionById = (id) => {
  return db.runSync(
    `
    DELETE FROM transactions
    WHERE id = ?
    `,
    [id]
  );
};