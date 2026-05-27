import Company from "../models/Company";
import db from "./database";

type CompanyRow = {
  id: number;
  name: string;
  code: string;
};

export const insertCompany = async (
  name: string,
  code: string,
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append("symbol", code);

    const response = await fetch("https://www.cse.lk/api/companyInfoSummery", {
      method: "POST",
      body: formData,
    });

    if (response.status !== 200) {
      return false;
    }

    db.runSync("INSERT INTO companies (name, code) VALUES (?, ?)", [
      name,
      code,
    ]);

    return true;
  } catch {
    return false;
  }
};

export const getCompanies = (): Company[] => {
  const rows = db.getAllSync(
    "SELECT * FROM companies ORDER BY name",
  ) as CompanyRow[];

  return rows.map((row) => new Company(row.id, row.name, row.code));
};

export const deleteCompanyById = (id: number): void => {
  db.runSync("DELETE FROM companies WHERE id = ?", [id]);
};
