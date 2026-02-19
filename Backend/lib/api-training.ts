import { TrainingRecord, TrainingSetRecord, TrainingStatsRecord } from "./store";

export interface ApiTrainingSet {
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

export interface ApiTraining {
  id: string;
  userId: string;
  routineId: string | null;
  routineNameSnapshot: string;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sets: ApiTrainingSet[];
}

export interface ApiTrainingStats extends TrainingStatsRecord {}
export interface ApiExerciseProgressStats {
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

export function toApiTrainingSet(record: TrainingSetRecord): ApiTrainingSet {
  return {
    id: record.id,
    trainingId: record.trainingId,
    routineExerciseId: record.routineExerciseId,
    exerciseNameSnapshot: record.exerciseNameSnapshot,
    exerciseTypeSnapshot: record.exerciseTypeSnapshot,
    setNumber: record.setNumber,
    weightKg: record.weightKg,
    durationSec: record.durationSec,
    distanceMeters: record.distanceMeters,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    routineExercisePhotoUrl: record.routineExercisePhotoUrl,
  };
}

export function toApiTraining(record: TrainingRecord): ApiTraining {
  return {
    id: record.id,
    userId: record.userId,
    routineId: record.routineId,
    routineNameSnapshot: record.routineNameSnapshot,
    startedAt: record.startedAt.toISOString(),
    endedAt: record.endedAt ? record.endedAt.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    sets: record.sets.map(toApiTrainingSet),
  };
}

export function toApiTrainingStats(record: TrainingStatsRecord): ApiTrainingStats {
  return record;
}

export function toApiExerciseProgressStats(
  record: {
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
): ApiExerciseProgressStats {
  return record;
}
