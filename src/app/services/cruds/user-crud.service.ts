import { Injectable } from '@angular/core';
import { SqliteService } from '../sql-lite.service';
import { selectAll } from '../../utils/sql-utils';

@Injectable({ providedIn: 'root' })
export class UserCrudService {
  constructor(private sqliteService: SqliteService) {}

  async addUser(id: string, name: string, email: string, password: string): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run(`INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)`, [id, name, email, password]);
  }

  async getUsers(): Promise<any[]> {
    const db = await this.sqliteService.getDb();
    if (!db) return [];
    return await selectAll(db, 'users');
  }

  async deleteUser(id: string): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run('DELETE FROM users WHERE id = ?', [id]);
  }

  async updateUser(id: string, name: string, email: string): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run(`UPDATE users SET name = ?, email = ? WHERE id = ?`, [name, email, id]);
  }
}
