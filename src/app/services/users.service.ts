import { Injectable } from '@angular/core';
import { SqliteService } from './sql-lite.service';
import { User } from '../models/users.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private table = 'users';

  constructor(private sqliteService: SqliteService) {}

  // -------------------------
  // CREATE
  // -------------------------
  async create(user: Omit<User, 'id'>): Promise<User> {
    const id = uuidv4();

    const sql = `
      INSERT INTO ${this.table} (id, name, email, password)
      VALUES (?, ?, ?, ?)
    `;

    await this.sqliteService.run(sql, [
      id,
      user.name,
      user.email,
      user.password,
    ]);

    return { id, ...user };
  }

  /**
   * Reinserta un usuario en la BD (p. ej. cuando la BD restaurada vino vacía).
   */
  async reinsertUser(user: User): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO ${this.table} (id, name, email, password)
      VALUES (?, ?, ?, ?)
    `;
    await this.sqliteService.run(sql, [user.id, user.name, user.email, user.password]);
  }

  // -------------------------
  // GET BY ID
  // -------------------------
  async getById(id: string): Promise<User | null> {
    const sql = `SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`;
    const rows = await this.sqliteService.execQuery(sql, [id]);

    if (!rows.length) return null;

    return this.mapRow(rows[0]);
  }

  // -------------------------
  // GET BY EMAIL
  // -------------------------
  async getByEmail(email: string): Promise<User | null> {
    const sql = `SELECT * FROM ${this.table} WHERE email = ? LIMIT 1`;
    const rows = await this.sqliteService.execQuery(sql, [email]);

    if (!rows.length) return null;

    return this.mapRow(rows[0]);
  }

  // -------------------------
  // GET ALL
  // -------------------------
  async getAll(): Promise<User[]> {
    const sql = `SELECT * FROM ${this.table}`;
    const rows = await this.sqliteService.execQuery(sql);

    return rows.map((row: any) => this.mapRow(row));
  }

  // -------------------------
  // UPDATE
  // -------------------------
  async update(user: User): Promise<void> {
    const sql = `
      UPDATE ${this.table}
      SET name = ?, email = ?, password = ?
      WHERE id = ?
    `;

    await this.sqliteService.run(sql, [
      user.name,
      user.email,
      user.password,
      user.id,
    ]);
  }

  // -------------------------
  // DELETE
  // -------------------------
  async delete(id: string): Promise<void> {
    const sql = `DELETE FROM ${this.table} WHERE id = ?`;
    await this.sqliteService.run(sql, [id]);
  }

  // -------------------------
  // LOGIN VALIDATION
  // -------------------------
  async validateUser(email: string, password: string): Promise<User | null> {
    const sql = `
      SELECT * FROM ${this.table}
      WHERE email = ? AND password = ?
      LIMIT 1
    `;

    const rows = await this.sqliteService.execQuery(sql, [email, password]);

    if (!rows.length) return null;

    return this.mapRow(rows[0]);
  }

  // -------------------------
  // PRIVATE MAPPER
  // -------------------------
  private mapRow(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
    };
  }
}
