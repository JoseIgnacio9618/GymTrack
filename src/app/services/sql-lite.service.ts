import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import initSqlJs, { Database as SQLJsDatabase } from 'sql.js';
import { createTablesSQL } from '../migrations/create-tables';

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
        const SQL = await initSqlJs({
          locateFile: file => `assets/${file}`,
        });
        this.sqlJsDb = new SQL.Database();
        this.sqlJsDb.run(createTablesSQL);
        console.log('sql.js DB initialized');
      } else {
        this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);
        await this.db.open();
        await this.db.execute(createTablesSQL);
        console.log('Capacitor SQLite DB initialized');
      }
    } catch (err) {
      console.error('Error initializing DB:', err);
    }
  }

  async addExercise(name: string, repetitions: number): Promise<void> {
    const query = 'INSERT INTO exercises (name, repetitions) VALUES (?, ?)';
    if (this.platform === 'web') {
      if (!this.sqlJsDb) return;
      this.sqlJsDb.run(query, [name, repetitions]);
    } else {
      if (!this.db) return;
      await this.db.run(query, [name, repetitions]);
    }
  }

  async getExercises(): Promise<any[]> {
    const query = 'SELECT * FROM exercises';
    if (this.platform === 'web') {
      if (!this.sqlJsDb) return [];
      const result = this.sqlJsDb.exec(query);
      if (result.length > 0) {
        const rows = result[0].values;
        const columns = result[0].columns;
        return rows.map((row: any) =>
          Object.fromEntries(row.map((val: any, i: number) => [columns[i], val]))
        );
      }
      return [];
    } else {
      if (!this.db) return [];
      const result = await this.db.query(query);
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

  getDb() {
    return this.platform === 'web' ? this.sqlJsDb : this.db;
  }
}
