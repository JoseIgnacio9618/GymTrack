import { Injectable } from '@angular/core';
import { SqliteService } from '../sql-lite.service';
import { selectAll } from '../../utils/sql-utils';

@Injectable({ providedIn: 'root' })
export class ExerciseCrudService {
  constructor(private sqliteService: SqliteService) {}

  async addExercise(rutineId: number, name: string, photo: number): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run(`INSERT INTO exercises (rutineId, name, photo) VALUES (?, ?, ?)`, [rutineId, name, photo]);
  }

  async getExercises(): Promise<any[]> {
    const db = await this.sqliteService.getDb();
    if (!db) return [];
    return await selectAll(db, 'exercises');
  }

  async deleteExercise(id: number): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run('DELETE FROM exercises WHERE id = ?', [id]);
  }

  async updateExercise(id: number, name: string, photo: number): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run(`UPDATE exercises SET name = ?, photo = ? WHERE id = ?`, [name, photo, id]);
  }
}
