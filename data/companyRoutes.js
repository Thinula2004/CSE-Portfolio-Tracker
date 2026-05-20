import db from './database';

export const insertCompany = (name, code) => {
  return db.runSync(
    'INSERT INTO companies (name, code) VALUES (?, ?)',
    [name, code]
  );
};

export const getCompanies = () => {
  return db.getAllSync(
    'SELECT * FROM companies ORDER BY name'
  );
};

export const deleteCompanyById = (id) => {
  return db.runSync(
    'DELETE FROM companies WHERE id = ?',
    [id]
  );
};