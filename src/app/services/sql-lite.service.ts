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
