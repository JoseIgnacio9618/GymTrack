import { Injectable } from '@angular/core';
import { SqliteService } from '../sql-lite.service';
import { selectAll } from '../../utils/sql-utils';

@Injectable({ providedIn: 'root' })
export class RutineCrudService {
  constructor(private sqliteService: SqliteService) {}

  async addRutine(userId: string, name: string): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run(`INSERT INTO rutines (userId, name) VALUES (?, ?)`, [userId, name]);
  }

  async getRutines(): Promise<any[]> {
    const db = await this.sqliteService.getDb();
    if (!db) return [];
    return await selectAll(db, 'rutines');
  }

  async deleteRutine(id: number): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run('DELETE FROM rutines WHERE id = ?', [id]);
  }

  async updateRutine(id: number, name: string): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run(`UPDATE rutines SET name = ? WHERE id = ?`, [name, id]);
  }
}
