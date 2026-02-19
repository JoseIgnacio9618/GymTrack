import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Routine, RoutinePayload } from '../models/routine.model';

@Injectable({
  providedIn: 'root',
})
export class RoutineService {
  private readonly baseUrl = `${environment.apiUrl}/routines`;

  constructor(private http: HttpClient) {}

  async listByUser(userId: string): Promise<Routine[]> {
    return firstValueFrom(
      this.http.get<Routine[]>(this.baseUrl, { params: { userId } })
    );
  }

  async getById(userId: string, routineId: string): Promise<Routine | null> {
    try {
      return await firstValueFrom(
        this.http.get<Routine>(`${this.baseUrl}/${routineId}`, { params: { userId } })
      );
    } catch {
      return null;
    }
  }

  async create(userId: string, payload: RoutinePayload): Promise<Routine> {
    return firstValueFrom(
      this.http.post<Routine>(this.baseUrl, {
        userId,
        ...payload,
      })
    );
  }

  async update(userId: string, routineId: string, payload: RoutinePayload): Promise<Routine> {
    return firstValueFrom(
      this.http.patch<Routine>(`${this.baseUrl}/${routineId}`, {
        userId,
        ...payload,
      })
    );
  }

  async delete(userId: string, routineId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${routineId}`, { params: { userId } })
    );
  }
}
