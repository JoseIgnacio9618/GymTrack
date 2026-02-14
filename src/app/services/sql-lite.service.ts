import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import initSqlJs, { Database as SQLJsDatabase } from 'sql.js';
import { createTablesSQL } from '../db/migrations/create-tables';

const WEB_DB_STORAGE_KEY = 'gymtrack_sqljs_db';

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private sqlJsDb: SQLJsDatabase | null = null;
  private dbName = 'gymtrack.db';
  private platform: string;
  /** Resuelve cuando la BD está lista; el guard y AuthService pueden esperarla. */
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.platform = Capacitor.getPlatform();
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
  }

  /** Esperar a que initDB() haya terminado (para que el guard no corra con BD vacía). */
  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  async initDB(): Promise<void> {
    try {
      if (this.platform === 'web') {
        const SQL = await initSqlJs({ locateFile: (file) => `assets/${file}` });
        const saved = this.loadWebDbFromStorage();
        if (saved && saved.length > 0) {
          const copy = new Uint8Array(saved);
          this.sqlJsDb = new SQL.Database(copy);
          console.log('sql.js DB restored from storage');
        } else {
          this.sqlJsDb = new SQL.Database();
          this.sqlJsDb.run(createTablesSQL);
          this.persistWebDb();
          console.log('sql.js DB initialized (new)');
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
   * Ejecuta un SELECT y devuelve un array de filas como objetos { columna: valor }.
   */
  async execQuery(sql: string, params: any[] = []): Promise<any[]> {
    const db = this.platform === 'web' ? this.sqlJsDb : this.db;
    if (!db) return [];

    if (this.platform === 'web' && this.sqlJsDb) {
      // sql.js: soportar parámetros y devolver objetos
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
    } else if (this.db) {
      const res = await this.db.query(sql, params);
      return res.values ?? [];
    }
    return [];
  }

  /**
   * Ejecuta un comando INSERT, UPDATE o DELETE.
   */
  async run(sql: string, params: any[] = []): Promise<void> {
    const db = this.platform === 'web' ? this.sqlJsDb : this.db;
    if (!db) return;

    if (this.platform === 'web' && this.sqlJsDb) {
      this.sqlJsDb.run(sql, params);
      this.persistWebDb();
    } else if (this.db) {
      await this.db.run(sql, params);
    }
  }

  /**
   * Guarda la BD de sql.js en localStorage (solo web) para que persista al recargar.
   */
  private persistWebDb(): void {
    if (this.platform !== 'web' || !this.sqlJsDb) return;
    try {
      const data = this.sqlJsDb.export();
      const base64 = this.uint8ArrayToBase64(data);
      localStorage.setItem(WEB_DB_STORAGE_KEY, base64);
    } catch (e) {
      console.warn('Could not persist web DB:', e);
    }
  }

  /**
   * Carga la BD de sql.js desde localStorage (solo web).
   */
  private loadWebDbFromStorage(): Uint8Array | null {
    if (this.platform !== 'web') return null;
    try {
      const base64 = localStorage.getItem(WEB_DB_STORAGE_KEY);
      if (!base64) return null;
      return this.base64ToUint8Array(base64);
    } catch {
      return null;
    }
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    const chunkSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return typeof btoa !== 'undefined' ? btoa(binary) : '';
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = typeof atob !== 'undefined' ? atob(base64) : '';
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
