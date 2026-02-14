import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/users.model';
import { UserService } from './users.service';
import { SqliteService } from './sql-lite.service';

const STORAGE_KEY_USER_ID = 'gymtrack_user_id';
const STORAGE_KEY_USER_BACKUP = 'gymtrack_user_backup';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private initDone = false;

  constructor(
    private userService: UserService,
    private sqliteService: SqliteService,
  ) {}

  get currentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUserValue(): User | null {
    return this.currentUser$.getValue();
  }

  isLoggedIn(): boolean {
    return this.currentUser$.getValue() !== null;
  }

  /**
   * Restaura la sesión desde el almacenamiento. Espera a que la BD esté lista para evitar
   * que el guard corra antes que initDB() y getById devuelva null.
   */
  async initSession(): Promise<void> {
    if (this.initDone) return;
    await this.sqliteService.whenReady();
    const storedId = this.getStoredUserId();
    if (storedId) {
      let user = await this.userService.getById(storedId);
      if (!user) {
        user = this.getBackupUser();
        if (user && user.id === storedId) {
          await this.userService.reinsertUser(user);
        }
      }
      if (user) {
        this.currentUser$.next(user);
        this.setBackupUser(user);
      }
    }
    this.initDone = true;
  }

  /**
   * Inicia sesión con email y contraseña.
   */
  async login(email: string, password: string): Promise<{ success: true; user: User } | { success: false; message: string }> {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      return { success: false, message: 'Email o contraseña incorrectos.' };
    }
    if (!this.setStoredUserId(user.id)) {
      return { success: false, message: 'No se pudo guardar la sesión. Revisa el almacenamiento del navegador.' };
    }
    this.setBackupUser(user);
    this.currentUser$.next(user);
    return { success: true, user };
  }

  /**
   * Crea una cuenta y deja al usuario logueado.
   */
  async register(name: string, email: string, password: string): Promise<{ success: true; user: User } | { success: false; message: string }> {
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return { success: false, message: 'Nombre, email y contraseña son obligatorios.' };
    }

    const existing = await this.userService.getByEmail(trimmedEmail);
    if (existing) {
      return { success: false, message: 'Ya existe una cuenta con ese email.' };
    }

    const user = await this.userService.create({
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
    });
    if (!this.setStoredUserId(user.id)) {
      return { success: false, message: 'Cuenta creada pero no se pudo guardar la sesión. Inicia sesión manualmente.' };
    }
    this.setBackupUser(user);
    this.currentUser$.next(user);
    return { success: true, user };
  }

  logout(): void {
    this.clearStoredUserId();
    this.clearBackupUser();
    this.currentUser$.next(null);
  }

  private getStoredUserId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY_USER_ID);
    } catch {
      return null;
    }
  }

  /** Guarda el id del usuario en localStorage. Devuelve false solo si setItem lanza. */
  private setStoredUserId(id: string): boolean {
    try {
      localStorage.setItem(STORAGE_KEY_USER_ID, id);
      return true;
    } catch {
      return false;
    }
  }

  private clearStoredUserId(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_USER_ID);
    } catch {}
  }

  private setBackupUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEY_USER_BACKUP, JSON.stringify(user));
    } catch {}
  }

  private getBackupUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER_BACKUP);
      if (!raw) return null;
      const u = JSON.parse(raw) as User;
      return u?.id && u?.email ? u : null;
    } catch {
      return null;
    }
  }

  private clearBackupUser(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_USER_BACKUP);
    } catch {}
  }
}
