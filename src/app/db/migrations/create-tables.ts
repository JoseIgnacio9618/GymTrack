export const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS rutines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    name TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rutineId INTEGER,
    photo INTEGER,
    name TEXT,
    FOREIGN KEY (rutineId) REFERENCES rutines(id)
  );

  CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    excerciseId INTEGER,
    weight INTEGER,
    repetitions INTEGER,
    seriesOrder INTEGER,
    FOREIGN KEY (excerciseId) REFERENCES exercises(id)
  );
`;
