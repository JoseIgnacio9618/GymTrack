import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ExerciseType, Routine, RoutineExercise } from '../../models/routine.model';
import { ExerciseProgressStats, Training } from '../../models/training.model';
import { AuthService } from '../../services/auth.service';
import { RoutineService } from '../../services/routine.service';
import { TrainingService } from '../../services/training.service';

interface ExerciseSetInput {
  weightKg: string;
  durationSec: string;
  distanceMeters: string;
}

@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.page.html',
  styleUrls: ['./trainings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule],
})
export class TrainingsPage implements OnInit {
  routines: Routine[] = [];
  activeRoutine: Routine | null = null;
  activeTraining: Training | null = null;
  selectedRoutineId: string | null = null;
  loading = false;
  submitting = false;
  errorMessage: string | null = null;
  setInputs: Record<string, ExerciseSetInput> = {};
  photoVisibility: Record<string, boolean> = {};
  private exerciseStatsById: Record<string, ExerciseProgressStats> = {};

  constructor(
    private authService: AuthService,
    private routineService: RoutineService,
    private trainingService: TrainingService
  ) {}

  ngOnInit(): void {
    void this.loadData();
  }

  getSetsForExercise(exercise: RoutineExercise): number {
    if (!this.activeTraining) return 0;
    return this.activeTraining.sets.filter((set) => set.routineExerciseId === exercise.id).length;
  }

  getExerciseSets(exercise: RoutineExercise) {
    if (!this.activeTraining) return [];
    return this.activeTraining.sets.filter(
      (set) => set.routineExerciseId === exercise.id || set.exerciseNameSnapshot === exercise.name
    );
  }

  getExerciseStats(exercise: RoutineExercise): ExerciseProgressStats {
    return (
      this.exerciseStatsById[exercise.id] ?? {
        routineExerciseId: exercise.id,
        exerciseName: exercise.name,
        exerciseType: exercise.exerciseType,
        totalSets: 0,
        totalTrainings: 0,
        avgSetsPerTraining: 0,
        avgWeightKg: null,
        avgDurationSec: null,
        avgDistanceMeters: null,
      }
    );
  }

  getExerciseTypeLabel(exercise: RoutineExercise): string {
    switch (exercise.exerciseType) {
      case 'WEIGHT':
        return 'TRAININGS.EXERCISE_TYPE_WEIGHT';
      case 'DURATION':
        return 'TRAININGS.EXERCISE_TYPE_DURATION';
      case 'DISTANCE_TIME':
        return 'TRAININGS.EXERCISE_TYPE_DISTANCE_TIME';
      case 'CHRONO':
        return 'TRAININGS.EXERCISE_TYPE_CHRONO';
      default:
        return 'TRAININGS.EXERCISE_TYPE_WEIGHT';
    }
  }

  isPhotoVisible(exerciseId: string): boolean {
    return this.photoVisibility[exerciseId] ?? false;
  }

  togglePhoto(exerciseId: string): void {
    this.photoVisibility[exerciseId] = !this.isPhotoVisible(exerciseId);
  }

  async startTraining(): Promise<void> {
    const userId = this.authService.getCurrentUserValue()?.id;
    if (!userId) {
      this.errorMessage = 'TRAININGS.ERROR_USER';
      return;
    }
    if (!this.selectedRoutineId) {
      this.errorMessage = 'TRAININGS.ERROR_SELECT_ROUTINE';
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    try {
      const training = await this.trainingService.startTraining(userId, this.selectedRoutineId);
      this.activeTraining = training;
      this.activeRoutine = this.routines.find((routine) => routine.id === this.selectedRoutineId) ?? null;
      this.resetSetInputs();
      await this.loadExerciseStats(userId);
    } catch (error) {
      console.error('Start training error:', error);
      this.errorMessage = 'TRAININGS.ERROR_START';
    } finally {
      this.submitting = false;
    }
  }

  async addSet(exercise: RoutineExercise): Promise<void> {
    const userId = this.authService.getCurrentUserValue()?.id;
    if (!userId || !this.activeTraining) {
      this.errorMessage = 'TRAININGS.ERROR_USER';
      return;
    }

    const input = this.setInputs[exercise.id] ?? { weightKg: '', durationSec: '', distanceMeters: '' };
    const metrics = this.parseSetInputsByExerciseType(exercise.exerciseType, input);

    if (!metrics) {
      this.errorMessage = 'TRAININGS.ERROR_SET_VALUES';
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    try {
      const createdSet = await this.trainingService.addSet(this.activeTraining.id, {
        userId,
        routineExerciseId: exercise.id,
        weightKg: metrics.weightKg,
        durationSec: metrics.durationSec,
        distanceMeters: metrics.distanceMeters,
      });
      this.activeTraining = {
        ...this.activeTraining,
        sets: [...this.activeTraining.sets, createdSet],
      };
      this.setInputs[exercise.id] = { weightKg: '', durationSec: '', distanceMeters: '' };
      await this.loadExerciseStats(userId);
    } catch (error) {
      console.error('Add set error:', error);
      this.errorMessage = 'TRAININGS.ERROR_ADD_SET';
    } finally {
      this.submitting = false;
    }
  }

  async finishTraining(): Promise<void> {
    const userId = this.authService.getCurrentUserValue()?.id;
    if (!userId || !this.activeTraining) {
      this.errorMessage = 'TRAININGS.ERROR_USER';
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    try {
      await this.trainingService.completeTraining(userId, this.activeTraining.id);
      this.activeTraining = null;
      this.activeRoutine = null;
      this.photoVisibility = {};
      this.setInputs = {};
      this.exerciseStatsById = {};
    } catch (error) {
      console.error('Complete training error:', error);
      this.errorMessage = 'TRAININGS.ERROR_FINISH';
    } finally {
      this.submitting = false;
    }
  }

  private async loadData(): Promise<void> {
    const userId = this.authService.getCurrentUserValue()?.id;
    if (!userId) {
      this.errorMessage = 'TRAININGS.ERROR_USER';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    try {
      const [routines, activeTraining] = await Promise.all([
        this.routineService.listByUser(userId),
        this.trainingService.getActive(userId),
      ]);
      this.routines = routines;
      this.activeTraining = activeTraining;
      this.activeRoutine = activeTraining
        ? routines.find((routine) => routine.id === activeTraining.routineId) ?? null
        : null;
      this.selectedRoutineId = this.activeRoutine?.id ?? null;
      this.resetSetInputs();
      await this.loadExerciseStats(userId);
    } catch (error) {
      console.error('Load training page data error:', error);
      this.errorMessage = 'TRAININGS.ERROR_LOAD';
    } finally {
      this.loading = false;
    }
  }

  private resetSetInputs(): void {
    this.setInputs = {};
    if (!this.activeRoutine) return;
    for (const exercise of this.activeRoutine.exercises) {
      this.setInputs[exercise.id] = {
        weightKg: '',
        durationSec: '',
        distanceMeters: '',
      };
    }
  }

  private async loadExerciseStats(userId: string): Promise<void> {
    if (!this.activeRoutine) {
      this.exerciseStatsById = {};
      return;
    }

    const stats = await this.trainingService.getExerciseStats(userId, this.activeRoutine.id);
    this.exerciseStatsById = {};
    for (const item of stats) {
      this.exerciseStatsById[item.routineExerciseId] = item;
    }
  }

  private parseSetInputsByExerciseType(
    exerciseType: ExerciseType,
    input: ExerciseSetInput
  ): { weightKg?: number; durationSec?: number; distanceMeters?: number } | null {
    const weightValue = Number(input.weightKg);
    const durationValue = Number(input.durationSec);
    const distanceValue = Number(input.distanceMeters);

    const weightKg =
      input.weightKg.trim() !== '' && Number.isFinite(weightValue) && weightValue > 0
        ? weightValue
        : undefined;
    const durationSec =
      input.durationSec.trim() !== '' && Number.isInteger(durationValue) && durationValue > 0
        ? durationValue
        : undefined;
    const distanceMeters =
      input.distanceMeters.trim() !== '' && Number.isFinite(distanceValue) && distanceValue > 0
        ? distanceValue
        : undefined;

    switch (exerciseType) {
      case 'WEIGHT':
        return weightKg ? { weightKg } : null;
      case 'DURATION':
      case 'CHRONO':
        return durationSec ? { durationSec } : null;
      case 'DISTANCE_TIME':
        return durationSec && distanceMeters ? { durationSec, distanceMeters } : null;
      default:
        return null;
    }
  }
}