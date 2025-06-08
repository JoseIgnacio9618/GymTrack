import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import initSqlJs, { Database as SQLJsDatabase } from 'sql.js';

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private sqlJsDb: SQLJsDatabase | null = null;
  private dbName = 'gymtrack.db';
  private platform: string;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.platform = Capacitor.getPlatform();
  }

  async initDB(): Promise<void> {
    try {
      if (this.platform === 'web') {
        // Usar sql.js
        const SQL = await initSqlJs({
          locateFile: file => `assets/${file}`,
        });

        this.sqlJsDb = new SQL.Database();

        // Crear tabla
        this.sqlJsDb.run(`
          CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            repetitions INTEGER
          );
        `);

        console.log('sql.js DB initialized');
      } else {
        // Móvil (iOS / Android)
        this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);
        await this.db.open();

        await this.db.execute(`
          CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            repetitions INTEGER
          );
        `);

        console.log('Capacitor SQLite DB initialized');
      }
    } catch (err) {
      console.error('Error initializing DB:', err);
    }
  }

  async addExercise(name: string, repetitions: number): Promise<void> {
    if (this.platform === 'web') {
      if (!this.sqlJsDb) return;
      this.sqlJsDb.run(
        'INSERT INTO exercises (name, repetitions) VALUES (?, ?)',
        [name, repetitions]
      );
    } else {
      if (!this.db) return;
      await this.db.run(
        'INSERT INTO exercises (name, repetitions) VALUES (?, ?)',
        [name, repetitions]
      );
    }
  }

  async getExercises(): Promise<any[]> {
    if (this.platform === 'web') {
      if (!this.sqlJsDb) return [];
      const result = this.sqlJsDb.exec('SELECT * FROM exercises');
      if (result.length > 0) {
        const rows = result[0].values;
        const columns = result[0].columns;
        return rows.map((row:any) =>
          Object.fromEntries(row.map((val:any, i:any) => [columns[i], val]))
        );
      }
      return [];
    } else {
      if (!this.db) return [];
      const result = await this.db.query('SELECT * FROM exercises');
      return result.values || [];
    }
  }

  async closeDB(): Promise<void> {
    if (this.platform === 'web') {
      this.sqlJsDb = null;
    } else {
      if (this.db) {
        await this.sqlite.closeConnection(this.dbName, false);
        this.db = null;
        console.log('SQLite DB closed');
      }
    }
  }
}
