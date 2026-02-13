import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import initSqlJs, { Database as SQLJsDatabase } from 'sql.js';
import { createTablesSQL } from '../db/migrations/create-tables';

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
        const SQL = await initSqlJs({ locateFile: (file) => `assets/${file}` });
        this.sqlJsDb = new SQL.Database();
        this.sqlJsDb.run(createTablesSQL);
        console.log('sql.js DB initialized');
      } else {
        this.db = await this.sqlite.createConnection(
          this.dbName,
          false,
          'no-encryption',
          1,
          false
        );
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

  // ------------------------ MÉTODOS GENÉRICOS ------------------------

  /**
   * Ejecuta un SELECT y devuelve un array de filas.
   */
  async execQuery(sql: string, params: any[] = []): Promise<any[]> {
    const db = this.platform === 'web' ? this.sqlJsDb : this.db;
    if (!db) return [];

    if ('exec' in db) {
      // sql.js
      const res = db.exec(sql);
      if (!res.length) return [];
      return res[0].values;
    } else {
      // Capacitor SQLite
      const res = await db.query(sql, params);
      return res.values ?? [];
    }
  }

  /**
   * Ejecuta un comando INSERT, UPDATE o DELETE.
   */
  async run(sql: string, params: any[] = []): Promise<void> {
    const db = this.platform === 'web' ? this.sqlJsDb : this.db;
    if (!db) return;

    if ('run' in db) {
      // sql.js
      (db as SQLJsDatabase).run(sql);
    } else {
      // Capacitor SQLite
      await (db as SQLiteDBConnection).run(sql, params);
    }
  }
}
