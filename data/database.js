import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('shares.db');

export default db;