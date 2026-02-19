import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { RoutineService } from '../../services/routine.service';
import { ExerciseType, RoutineExercisePayload } from '../../models/routine.model';
import { PhotoService } from '../../services/photo.service';

interface EditableExercise extends RoutineExercisePayload {
  showPhoto: boolean;
}

@Component({
  selector: 'app-create-routine',
  templateUrl: './create-routine.page.html',
  styleUrls: ['./create-routine.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    TranslateModule,
  ],
})
export class CreateRoutinePage implements OnInit, OnDestroy {
  readonly exerciseTypeOptions: { value: ExerciseType; labelKey: string }[] = [
    { value: 'WEIGHT', labelKey: 'CREATE_ROUTINE.EXERCISE_TYPE_WEIGHT' },
    { value: 'DURATION', labelKey: 'CREATE_ROUTINE.EXERCISE_TYPE_DURATION' },
    { value: 'DISTANCE_TIME', labelKey: 'CREATE_ROUTINE.EXERCISE_TYPE_DISTANCE_TIME' },
    { value: 'CHRONO', labelKey: 'CREATE_ROUTINE.EXERCISE_TYPE_CHRONO' },
  ];
  routineId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;
  uploadingPhotoIndex: number | null = null;
  errorMessage: string | null = null;
  routineName = '';
  routineDescription = '';
  exercises: EditableExercise[] = [this.createEmptyExercise()];
  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private routineService: RoutineService,
    private photoService: PhotoService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const id = params.get('id');
        void this.loadRoutine(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get titleKey(): string {
    return this.isEditMode ? 'CREATE_ROUTINE.EDIT_TITLE' : 'CREATE_ROUTINE.TITLE';
  }

  addExercise(): void {
    this.exercises = [...this.exercises, this.createEmptyExercise()];
  }

  removeExercise(index: number): void {
    if (this.exercises.length <= 1) {
      this.exercises = [this.createEmptyExercise()];
      return;
    }
    this.exercises = this.exercises.filter((_, i) => i !== index);
  }

  togglePhoto(index: number): void {
    this.exercises = this.exercises.map((exercise, i) =>
      i === index ? { ...exercise, showPhoto: !exercise.showPhoto } : exercise
    );
  }

  removePhoto(index: number): void {
    this.exercises = this.exercises.map((exercise, i) =>
      i === index ? { ...exercise, photoUrl: null, showPhoto: false } : exercise
    );
  }

  async uploadPhotoFromCamera(index: number): Promise<void> {
    await this.uploadPhoto(index, 'camera');
  }

  async uploadPhotoFromGallery(index: number): Promise<void> {
    await this.uploadPhoto(index, 'gallery');
  }

  async saveRoutine(): Promise<void> {
    const userId = this.authService.getCurrentUserValue()?.id;
    if (!userId) {
      this.errorMessage = 'CREATE_ROUTINE.ERROR_USER';
      return;
    }

    const name = this.routineName.trim();
    if (name.length < 2) {
      this.errorMessage = 'CREATE_ROUTINE.ERROR_NAME';
      return;
    }

    const exercises = this.exercises
      .map((exercise) => ({
        name: (exercise.name ?? '').trim(),
        exerciseType: exercise.exerciseType ?? 'WEIGHT',
        description: (exercise.description ?? '').trim() || null,
        photoUrl: (exercise.photoUrl ?? '').trim() || null,
      }))
      .filter((exercise) => exercise.name.length > 0);

    if (exercises.length === 0) {
      this.errorMessage = 'CREATE_ROUTINE.ERROR_EXERCISE';
      return;
    }

    this.saving = true;
    this.errorMessage = null;

    try {
      if (this.isEditMode && this.routineId) {
        await this.routineService.update(userId, this.routineId, {
          name,
          description: this.routineDescription.trim() || null,
          exercises,
        });
      } else {
        await this.routineService.create(userId, {
          name,
          description: this.routineDescription.trim() || null,
          exercises,
        });
      }

      await this.router.navigate(['/my-routines'], { replaceUrl: true });
    } catch (error) {
      console.error('Save routine error:', error);
      this.errorMessage = 'CREATE_ROUTINE.SAVE_ERROR';
    } finally {
      this.saving = false;
    }
  }

  private createEmptyExercise(): EditableExercise {
    return {
      name: '',
      exerciseType: 'WEIGHT',
      description: '',
      photoUrl: '',
      showPhoto: false,
    };
  }

  private async uploadPhoto(index: number, source: 'camera' | 'gallery'): Promise<void> {
    this.uploadingPhotoIndex = index;
    this.errorMessage = null;
    try {
      const photoUrl =
        source === 'camera'
          ? await this.photoService.captureFromCameraAndUpload()
          : await this.photoService.pickFromGalleryAndUpload();

      this.exercises = this.exercises.map((exercise, i) =>
        i === index ? { ...exercise, photoUrl, showPhoto: true } : exercise
      );
    } catch (error) {
      if (this.isPhotoCancelledError(error)) {
        return;
      }
      console.error('Upload photo error:', error);
      this.errorMessage = 'CREATE_ROUTINE.ERROR_UPLOAD_PHOTO';
    } finally {
      this.uploadingPhotoIndex = null;
    }
  }

  private isPhotoCancelledError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return message.includes('cancel') || message.includes('cancelled') || message.includes('canceled');
  }

  private async loadRoutine(routineId: string | null): Promise<void> {
    this.errorMessage = null;

    if (!routineId) {
      this.isEditMode = false;
      this.routineId = null;
      this.routineName = '';
      this.routineDescription = '';
      this.exercises = [this.createEmptyExercise()];
      return;
    }

    const userId = this.authService.getCurrentUserValue()?.id;
    if (!userId) {
      this.errorMessage = 'CREATE_ROUTINE.ERROR_USER';
      return;
    }

    this.loading = true;
    this.isEditMode = true;
    this.routineId = routineId;

    try {
      const routine = await this.routineService.getById(userId, routineId);
      if (!routine) {
        this.errorMessage = 'CREATE_ROUTINE.LOAD_ERROR';
        return;
      }

      this.routineName = routine.name;
      this.routineDescription = routine.description ?? '';
      this.exercises = routine.exercises.map((exercise) => ({
        name: exercise.name,
        exerciseType: exercise.exerciseType ?? 'WEIGHT',
        description: exercise.description ?? '',
        photoUrl: exercise.photoUrl ?? '',
        showPhoto: false,
      }));
      if (this.exercises.length === 0) {
        this.exercises = [this.createEmptyExercise()];
      }
    } catch (error) {
      console.error('Load routine error:', error);
      this.errorMessage = 'CREATE_ROUTINE.LOAD_ERROR';
    } finally {
      this.loading = false;
    }
  }

}
