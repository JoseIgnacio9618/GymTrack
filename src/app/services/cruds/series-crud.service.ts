import { Injectable } from '@angular/core';
import { SqliteService } from '../sql-lite.service';
import { selectAll } from '../../utils/sql-utils';

@Injectable({ providedIn: 'root' })
export class SeriesCrudService {
  constructor(private sqliteService: SqliteService) {}

  async addSeries(exerciseId: number, weight: number, repetitions: number, seriesOrder: number): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run(
      `INSERT INTO series (excerciseId, weight, repetitions, seriesOrder) VALUES (?, ?, ?, ?)`,
      [exerciseId, weight, repetitions, seriesOrder]
    );
  }

  async getSeriesByExercise(exerciseId: number): Promise<any[]> {
    const db = await this.sqliteService.getDb();
    if (!db) return [];
    return await selectAll(db, 'series', 'WHERE excerciseId = ?', [exerciseId]);
  }

  async deleteSeries(id: number): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run('DELETE FROM series WHERE id = ?', [id]);
  }

  async updateSeries(id: number, weight: number, repetitions: number, seriesOrder: number): Promise<void> {
    const db = await this.sqliteService.getDb();
    if (!db) return;
    await db.run(
      `UPDATE series SET weight = ?, repetitions = ?, seriesOrder = ? WHERE id = ?`,
      [weight, repetitions, seriesOrder, id]
    );
  }
}
