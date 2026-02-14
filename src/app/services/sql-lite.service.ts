import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { createTablesSQL } from '../db/migrations/create-tables';

const WEB_DB_STORAGE_KEY = 'gymtrack_sqljs_db';

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private sqlJsDb: any | null = null;
  private dbName = 'gymtrack.db';
  private platform: string;

  private readyPromise: Promise<void>;
  private resolveReady!: () => void;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.platform = Capacitor.getPlatform();

    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
  }

  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  async initDB(): Promise<void> {
    try {
      if (this.platform === 'web') {
        const initSqlJs = (window as any).initSqlJs;

        if (!initSqlJs) {
          throw new Error('sql.js no está cargado en window');
        }

        const SQL = await initSqlJs({
          locateFile: () => 'assets/sqljs/sql-wasm.wasm',
        });

        const saved = this.loadWebDbFromStorage();

        if (saved && saved.length > 0) {
          this.sqlJsDb = new SQL.Database(new Uint8Array(saved));
          console.log('sql.js DB restored');
        } else {
          this.sqlJsDb = new SQL.Database();
          this.sqlJsDb.run(createTablesSQL);
          this.persistWebDb();
          console.log('sql.js DB created');
        }
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
    } finally {
      this.resolveReady();
    }
  }

  async closeDB(): Promise<void> {
    if (this.platform === 'web') {
      this.sqlJsDb = null;
    } else if (this.db) {
      await this.sqlite.closeConnection(this.dbName, false);
      this.db = null;
    }
  }

  async execQuery(sql: string, params: any[] = []): Promise<any[]> {
    const db = this.platform === 'web' ? this.sqlJsDb : this.db;
    if (!db) return [];

    if (this.platform === 'web' && this.sqlJsDb) {
      if (params.length > 0) {
        const stmt = this.sqlJsDb.prepare(sql);
        stmt.bind(params);
        const rows: any[] = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      }

      const res = this.sqlJsDb.exec(sql);
      if (!res.length) return [];

      const { columns, values } = res[0];

      return values.map((row: any[]) =>
        Object.fromEntries(row.map((val, i) => [columns[i], val]))
      );
    }

    if (this.db) {
      const res = await this.db.query(sql, params);
      return res.values ?? [];
    }

    return [];
  }

  async run(sql: string, params: any[] = []): Promise<void> {
    const db = this.platform === 'web' ? this.sqlJsDb : this.db;
    if (!db) return;

    if (this.platform === 'web' && this.sqlJsDb) {
      this.sqlJsDb.run(sql, params);
      this.persistWebDb();
      return;
    }

    if (this.db) {
      await this.db.run(sql, params);
    }
  }

  private persistWebDb(): void {
    if (this.platform !== 'web' || !this.sqlJsDb) return;

    const data = this.sqlJsDb.export();
    const base64 = this.uint8ArrayToBase64(data);
    localStorage.setItem(WEB_DB_STORAGE_KEY, base64);
  }

  private loadWebDbFromStorage(): Uint8Array | null {
    if (this.platform !== 'web') return null;

    const base64 = localStorage.getItem(WEB_DB_STORAGE_KEY);
    if (!base64) return null;

    return this.base64ToUint8Array(base64);
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  }
}
