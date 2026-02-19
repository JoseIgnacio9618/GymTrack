import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Training, TrainingSet } from '../../models/training.model';
import { AuthService } from '../../services/auth.service';
import { TrainingService } from '../../services/training.service';

interface GroupedTrainingSets {
  exerciseName: string;
  photoUrl: string | null;
  sets: TrainingSet[];
}

@Component({
  selector: 'app-training-history',
  templateUrl: './training-history.page.html',
  styleUrls: ['./training-history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule],
})
export class TrainingHistoryPage implements OnInit {
  trainings: Training[] = [];
  loading = false;
  errorMessage: string | null = null;
  private photoVisibility: Record<string, boolean> = {};

  constructor(
    private authService: AuthService,
    private trainingService: TrainingService
  ) {}

  ngOnInit(): void {
    void this.loadHistory();
  }

  getGroupedSets(training: Training): GroupedTrainingSets[] {
    const grouped: Record<string, GroupedTrainingSets> = {};

    for (const set of training.sets) {
      const key = set.exerciseNameSnapshot;
      if (!grouped[key]) {
        grouped[key] = {
          exerciseName: set.exerciseNameSnapshot,
          photoUrl: set.routineExercisePhotoUrl,
          sets: [],
        };
      }
      grouped[key].sets.push(set);
      if (!grouped[key].photoUrl && set.routineExercisePhotoUrl) {
        grouped[key].photoUrl = set.routineExercisePhotoUrl;
      }
    }

    return Object.values(grouped);
  }

  photoKey(trainingId: string, exerciseName: string): string {
    return `${trainingId}:${exerciseName}`;
  }

  isPhotoVisible(trainingId: string, exerciseName: string): boolean {
    return this.photoVisibility[this.photoKey(trainingId, exerciseName)] ?? false;
  }

  togglePhoto(trainingId: string, exerciseName: string): void {
    const key = this.photoKey(trainingId, exerciseName);
    this.photoVisibility[key] = !this.photoVisibility[key];
  }

  private async loadHistory(): Promise<void> {
    const userId = this.authService.getCurrentUserValue()?.id;
    if (!userId) {
      this.errorMessage = 'TRAINING_HISTORY.ERROR_USER';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    try {
      this.trainings = await this.trainingService.getHistory(userId);
    } catch (error) {
      console.error('Load training history error:', error);
      this.errorMessage = 'TRAINING_HISTORY.ERROR_LOAD';
    } finally {
      this.loading = false;
    }
  }
}
