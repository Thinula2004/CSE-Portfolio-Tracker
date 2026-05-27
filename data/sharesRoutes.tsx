import Company from "../models/Company";
import Share from "../models/Share";
import Transaction from "../models/Transaction";
import db from "./database";

type ShareRow = {
  amount_of_shares: number;
  average_cost_per_share: number;
  total_cost: number;
};

type ShareCountRow = {
  amount_of_shares: number;
};

export const addShares = (
  companyId: number,
  shareCount: number,
  netAmount: number,
): void => {
  const existing = db.getFirstSync(
    `
    SELECT amount_of_shares, total_cost
    FROM shares
    WHERE company_id = ?
    `,
    [companyId],
  ) as Pick<ShareRow, "amount_of_shares" | "total_cost"> | null;

  if (shareCount <= 0) {
    throw new Error("shareCount must be greater than 0");
  }

  if (existing) {
    const newAmount = existing.amount_of_shares + shareCount;

    const newTotalCost = existing.total_cost + netAmount;

    const newAvgCost = newTotalCost / newAmount;

    db.runSync(
      `
      UPDATE shares
      SET
        amount_of_shares = ?,
        average_cost_per_share = ?,
        total_cost = ?
      WHERE company_id = ?
      `,
      [newAmount, newAvgCost, newTotalCost, companyId],
    );
  } else {
    db.runSync(
      `
      INSERT INTO shares (
        company_id,
        amount_of_shares,
        average_cost_per_share,
        total_cost
      )
      VALUES (?, ?, ?, ?)
      `,
      [companyId, shareCount, netAmount / shareCount, netAmount],
    );
  }
};

export const addSharesOnTransactionDelete = (
  transaction: Transaction,
): void => {
  const existing = db.getFirstSync(
    `
  SELECT
    amount_of_shares,
    total_cost,
    average_cost_per_share
  FROM shares
  WHERE company_id = ?
  `,
    [transaction.company.id],
  ) as Pick<
    ShareRow,
    "amount_of_shares" | "total_cost" | "average_cost_per_share"
  > | null;

  if (existing) {
    const newAmount = existing.amount_of_shares + transaction.shareCount;

    const newTotalCost =
      existing.total_cost +
      existing.average_cost_per_share * transaction.shareCount;

    db.runSync(
      `
      UPDATE shares
      SET
        amount_of_shares = ?,
        total_cost = ?
      WHERE company_id = ?
      `,
      [newAmount, newTotalCost, transaction.company.id],
    );
  } else {
    const netAmount =
      transaction.grossAmount + transaction.grossAmount * 0.0012;
    db.runSync(
      `
      INSERT INTO shares (
        company_id,
        amount_of_shares,
        average_cost_per_share,
        total_cost
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        transaction.company.id,
        transaction.shareCount,
        netAmount / transaction.shareCount,
        netAmount,
      ],
    );
  }
};

export const getShareCount = (companyId: number): number => {
  const row = db.getFirstSync(
    `
    SELECT amount_of_shares
    FROM shares
    WHERE company_id = ?
    `,
    [companyId],
  ) as ShareCountRow | null;

  return row ? row.amount_of_shares : 0;
};

export const deductShares = (companyId: number, shareCount: number): void => {
  if (shareCount <= 0) {
    throw new Error("shareCount must be greater than 0");
  }

  const existing = db.getFirstSync(
    `
    SELECT
      amount_of_shares,
      average_cost_per_share,
      total_cost
    FROM shares
    WHERE company_id = ?
    `,
    [companyId],
  ) as ShareRow | null;

  if (!existing) {
    throw new Error("No shares found for this company");
  }

  if (shareCount > existing.amount_of_shares) {
    throw new Error("Not enough shares to sell");
  }

  const deductingAmount = existing.average_cost_per_share * shareCount;

  const newAmount = existing.amount_of_shares - shareCount;

  const newTotalCost = existing.total_cost - deductingAmount;

  if (newAmount === 0) {
    db.runSync(
      `
      DELETE FROM shares
      WHERE company_id = ?
      `,
      [companyId],
    );
  } else {
    db.runSync(
      `
      UPDATE shares
      SET
        amount_of_shares = ?,
        total_cost = ?
      WHERE company_id = ?
      `,
      [newAmount, newTotalCost, companyId],
    );
  }
};

export const deductSharesOnTransactionDelete = (
  companyId: number,
  shareCount: number,
  amount: number,
): void => {
  const existing = db.getFirstSync(
    `
    SELECT
      amount_of_shares,
      average_cost_per_share,
      total_cost
    FROM shares
    WHERE company_id = ?
    `,
    [companyId],
  ) as ShareRow | null;

  if (!existing) {
    throw new Error("No shares found for this company");
  }

  if (shareCount > existing.amount_of_shares) {
    throw new Error("Not enough shares to sell");
  }

  const newAmount = existing.amount_of_shares - shareCount;

  if (newAmount === 0) {
    db.runSync(
      `
    DELETE FROM shares
    WHERE company_id = ?
    `,
      [companyId],
    );
  } else {
    const newTotalCost = existing.total_cost - amount;

    const newCostPerShare = newTotalCost / newAmount;

    db.runSync(
      `
    UPDATE shares
    SET
      amount_of_shares = ?,
      total_cost = ?,
      average_cost_per_share = ?
    WHERE company_id = ?
    `,
      [newAmount, newTotalCost, newCostPerShare, companyId],
    );
  }
};

type ShareRowFetch = {
  id: number;
  amount_of_shares: number;
  average_cost_per_share: number;
  total_cost: number;
  company_id: number;
  company_name: string;
  company_code: string;
};

export const getShares = () => {
  let query = `
    SELECT
      s.id,
      s.amount_of_shares,
      s.average_cost_per_share,
      s.total_cost,
      c.id as company_id,
      c.name as company_name,
      c.code as company_code
    FROM shares s
    JOIN companies c
      ON s.company_id = c.id
  `;

  const rows = db.getAllSync(query) as ShareRowFetch[];

  return rows.map((row) => {
    const company = new Company(
      row.company_id,
      row.company_name,
      row.company_code,
    );

    return new Share(
      row.id,
      company,
      row.amount_of_shares,
      row.average_cost_per_share,
      row.total_cost,
      "",
    );
  });
};

export const getAverageCostPerShare = (companyId: number): number => {
  const row = db.getFirstSync(
    `
    SELECT average_cost_per_share
    FROM shares
    WHERE company_id = ?
    `,
    [companyId],
  ) as { average_cost_per_share: number } | null;

  return row ? row.average_cost_per_share : 0;
};
