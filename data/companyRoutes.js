import Company from '../models/Company';
import db from './database';

export const insertCompany = (name, code) => {
  return db.runSync(
    'INSERT INTO companies (name, code) VALUES (?, ?)',
    [name, code]
  );
};

export const getCompanies = () => {
  const rows = db.getAllSync(
    'SELECT * FROM companies ORDER BY name'
  );


  return rows.map(row =>
    new Company(
      row.id,
      row.name,
      row.code
    )
  );
};

export const deleteCompanyById = (id) => {
  return db.runSync(
    'DELETE FROM companies WHERE id = ?',
    [id]
  );
};