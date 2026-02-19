import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AddTrainingSetPayload,
  ExerciseProgressStats,
  Training,
  TrainingSet,
  TrainingStats,
} from '../models/training.model';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  private readonly baseUrl = `${environment.apiUrl}/trainings`;

  constructor(private http: HttpClient) {}

  async getHistory(userId: string): Promise<Training[]> {
    return firstValueFrom(
      this.http.get<Training[]>(this.baseUrl, { params: { userId } })
    );
  }

  async getActive(userId: string): Promise<Training | null> {
    try {
      return await firstValueFrom(
        this.http.get<Training | null>(this.baseUrl, { params: { userId, active: 'true' } })
      );
    } catch {
      return null;
    }
  }

  async startTraining(userId: string, routineId: string): Promise<Training> {
    return firstValueFrom(
      this.http.post<Training>(this.baseUrl, { userId, routineId })
    );
  }

  async completeTraining(userId: string, trainingId: string): Promise<Training> {
    return firstValueFrom(
      this.http.patch<Training>(`${this.baseUrl}/${trainingId}`, { userId })
    );
  }

  async addSet(trainingId: string, payload: AddTrainingSetPayload): Promise<TrainingSet> {
    return firstValueFrom(
      this.http.post<TrainingSet>(`${this.baseUrl}/${trainingId}/sets`, payload)
    );
  }

  async getStats(userId: string): Promise<TrainingStats> {
    return firstValueFrom(
      this.http.get<TrainingStats>(`${this.baseUrl}/stats`, { params: { userId } })
    );
  }

  async getExerciseStats(userId: string, routineId: string): Promise<ExerciseProgressStats[]> {
    return firstValueFrom(
      this.http.get<ExerciseProgressStats[]>(`${this.baseUrl}/exercise-stats`, {
        params: { userId, routineId },
      })
    );
  }
}
