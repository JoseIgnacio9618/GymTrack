import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;
  private authUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene un usuario por id (backend: GET /users/:id o GET /auth/me).
   */
  async getById(id: string): Promise<User | null> {
    try {
      const user = await firstValueFrom(this.http.get<User>(`${this.baseUrl}/${id}`));
      return user ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Comprueba si existe un usuario con ese email (backend: GET /users?email=...).
   */
  async getByEmail(email: string): Promise<User | null> {
    try {
      const list = await firstValueFrom(
        this.http.get<User[]>(`${this.baseUrl}`, { params: { email } })
      );
      return list?.[0] ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Lista todos los usuarios (backend: GET /users). Para admin o futuro uso.
   */
  async getAll(): Promise<User[]> {
    try {
      const list = await firstValueFrom(this.http.get<User[]>(this.baseUrl));
      return list ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Crea un usuario (backend: POST /auth/register).
   */
  async create(user: Omit<User, 'id'>): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<User>(`${this.authUrl}/register`, user)
    );
    if (!res?.id) throw new Error('Backend no devolvió usuario');
    return res;
  }

  /**
   * Valida credenciales y devuelve el usuario (backend: POST /auth/login).
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await firstValueFrom(
        this.http.post<User>(`${this.authUrl}/login`, { email, password })
      );
      return user ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Actualiza un usuario (backend: PATCH /users/:id).
   */
  async update(user: User): Promise<void> {
    await firstValueFrom(
      this.http.patch<void>(`${this.baseUrl}/${user.id}`, {
        name: user.name,
        email: user.email,
        password: user.password,
      })
    );
  }

  /**
   * Elimina un usuario (backend: DELETE /users/:id).
   */
  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }

  /**
   * Reinsertar usuario en BD local: con backend no se usa; se mantiene por compatibilidad con AuthService (backup restore).
   * Opcional: si el backend admite "sync", aquí se podría llamar a POST /users con el usuario de backup.
   */
  async reinsertUser(user: User): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<User>(this.baseUrl, user)
      );
    } catch {
      // Backend puede no tener este endpoint; no bloqueamos el flujo
    }
  }
}
