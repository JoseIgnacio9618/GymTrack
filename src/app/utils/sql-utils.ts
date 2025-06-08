// src/app/utils/sql-utils.ts
import { Capacitor } from '@capacitor/core';
import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { Database } from 'sql.js';

export async function selectAll(
  db: SQLiteDBConnection | Database,
  table: string,
  whereClause = '',
  params: any[] = []
): Promise<any[]> {
  const sql = `SELECT * FROM ${table} ${whereClause}`;
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    const result = (db as Database).exec(sql);
    if (!result.length) return [];
    const { columns, values } = result[0];
    return values.map(row =>
      Object.fromEntries(row.map((val, i) => [columns[i], val]))
    );
  } else {
    const result = await (db as SQLiteDBConnection).query(sql, params);
    return result.values || [];
  }
}
