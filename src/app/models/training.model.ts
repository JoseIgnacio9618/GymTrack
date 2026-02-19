export interface TrainingSet {
  id: string;
  trainingId: string;
  routineExerciseId: string | null;
  exerciseNameSnapshot: string;
  exerciseTypeSnapshot: string;
  setNumber: number;
  weightKg: number | null;
  durationSec: number | null;
  distanceMeters: number | null;
  createdAt: string;
  updatedAt: string;
  routineExercisePhotoUrl: string | null;
}

export interface Training {
  id: string;
  userId: string;
  routineId: string | null;
  routineNameSnapshot: string;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sets: TrainingSet[];
}

export interface TrainingStats {
  trainingsCount: number;
  totalSets: number;
  avgSetsPerTraining: number;
  avgWeightKg: number | null;
  avgDurationSec: number | null;
}

export interface AddTrainingSetPayload {
  userId: string;
  routineExerciseId: string;
  weightKg?: number;
  durationSec?: number;
  distanceMeters?: number;
}

export interface ExerciseProgressStats {
  routineExerciseId: string;
  exerciseName: string;
  exerciseType: string;
  totalSets: number;
  totalTrainings: number;
  avgSetsPerTraining: number;
  avgWeightKg: number | null;
  avgDurationSec: number | null;
  avgDistanceMeters: number | null;
}
