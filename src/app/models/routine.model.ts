export type ExerciseType = 'WEIGHT' | 'DURATION' | 'DISTANCE_TIME' | 'CHRONO';

export interface RoutineExercise {
  id: string;
  routineId: string;
  name: string;
  exerciseType: ExerciseType;
  description: string | null;
  photoUrl: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  exercises: RoutineExercise[];
}

export interface RoutineExercisePayload {
  name: string;
  exerciseType: ExerciseType;
  description?: string | null;
  photoUrl?: string | null;
}

export interface RoutinePayload {
  name: string;
  description?: string | null;
  exercises: RoutineExercisePayload[];
}
