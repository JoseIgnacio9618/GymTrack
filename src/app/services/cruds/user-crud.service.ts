import { Injectable } from '@angular/core';
import { SqliteService } from '../sql-lite.service';
import { User } from '../../models/User';

@Injectable({ providedIn: 'root' })
export class UserCrudService {
  userLogged: User | undefined = undefined;

  constructor(private sqliteService: SqliteService) {}

  // ------------------ ADD USER ------------------
  async addUser(id: string, name: string, email: string, password: string): Promise<void> {
    await this.sqliteService.run(
      `INSERT INTO users (id, name, email, password) VALUES (?,?,?,?)`,
      [id, name, email, password]
    );
  }

  // ------------------ GET ALL USERS ------------------
  async getUsers(): Promise<User[]> {
    const rows = await this.sqliteService.execQuery(`SELECT * FROM users`);
    return rows.map(([id, name, email, password]) => ({ id, name, email, password }));
  }

  // ------------------ LOGIN ------------------
  async login(email: string, password: string): Promise<User | null> {
    const rows = await this.sqliteService.execQuery(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (!rows.length) return null;

    const [id, name, emailRes, passwordRes] = rows[0];
    const user: User = { id, name, email: emailRes, password: passwordRes };

    // TODO: bcrypt.compare en producción
    if (user.password !== password) return null;

    this.userLogged = user;
    return user;
  }

  // ------------------ DELETE USER ------------------
  async deleteUser(id: string): Promise<void> {
    await this.sqliteService.run(`DELETE FROM users WHERE id = ?`, [id]);
  }

  // ------------------ UPDATE USER ------------------
  async updateUser(id: string, name: string, email: string): Promise<void> {
    await this.sqliteService.run(`UPDATE users SET name = ?, email = ? WHERE id = ?`, [name, email, id]);
  }

  getCurrentUser(): User | undefined {
    return this.userLogged;
  }
}
