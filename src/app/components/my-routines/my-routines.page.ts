import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Routine, RoutineExercise } from '../../models/routine.model';
import { AuthService } from '../../services/auth.service';
import { RoutineService } from '../../services/routine.service';

@Component({
  selector: 'app-my-routines',
  templateUrl: './my-routines.page.html',
  styleUrls: ['./my-routines.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule],
})
export class MyRoutinesPage implements OnInit {
  routines: Routine[] = [];
  loading = false;
  errorMessage: string | null = null;
  private exercisePhotoVisibility: Record<string, boolean> = {};
  private routineDetailsVisibility: Record<string, boolean> = {};

  constructor(
    private authService: AuthService,
    private routineService: RoutineService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    void this.loadRoutines();
  }

  async refresh(): Promise<void> {
    await this.loadRoutines();
  }

  isDetailsVisible(routineId: string): boolean {
    return this.routineDetailsVisibility[routineId] ?? false;
  }

  toggleRoutineDetails(routineId: string): void {
    this.routineDetailsVisibility[routineId] = !this.isDetailsVisible(routineId);
  }

  isPhotoVisible(exerciseId: string): boolean {
    return this.exercisePhotoVisibility[exerciseId] ?? false;
  }

  togglePhoto(exercise: RoutineExercise): void {
    this.exercisePhotoVisibility[exercise.id] = !this.isPhotoVisible(exercise.id);
  }

  goToCreateRoutine(): void {
    void this.router.navigate(['/create-routine']);
  }

  goToEditRoutine(routineId: string): void {
    void this.router.navigate(['/create-routine', routineId]);
  }

  async deleteRoutine(routineId: string): Promise<void> {
    const userId = this.authService.getCurrentUserValue()?.id;
    if (!userId) {
      this.errorMessage = 'ROUTINES.ERROR_USER';
      return;
    }

    const confirmed = window.confirm(this.translate.instant('ROUTINES.CONFIRM_DELETE'));
    if (!confirmed) return;

    try {
      await this.routineService.delete(userId, routineId);
      await this.loadRoutines();
    } catch (error) {
      console.error('Delete routine error:', error);
      this.errorMessage = 'ROUTINES.ERROR_DELETE';
    }
  }

  private async loadRoutines(): Promise<void> {
    const userId = this.authService.getCurrentUserValue()?.id;
    if (!userId) {
      this.errorMessage = 'ROUTINES.ERROR_USER';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    try {
      this.routines = await this.routineService.listByUser(userId);
    } catch (error) {
      console.error('Load routines error:', error);
      this.errorMessage = 'ROUTINES.ERROR_LOAD';
    } finally {
      this.loading = false;
    }
  }
}

