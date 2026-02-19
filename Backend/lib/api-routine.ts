import { RoutineRecord } from "./store";

export interface ApiRoutineExercise {
  id: string;
  routineId: string;
  name: string;
  exerciseType: string;
  description: string | null;
  photoUrl: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRoutine {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  exercises: ApiRoutineExercise[];
}

export function toApiRoutine(record: RoutineRecord): ApiRoutine {
  return {
    id: record.id,
    userId: record.userId,
    name: record.name,
    description: record.description,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    exercises: record.exercises.map((exercise) => ({
      id: exercise.id,
      routineId: exercise.routineId,
      name: exercise.name,
      exerciseType: exercise.exerciseType,
      description: exercise.description,
      photoUrl: exercise.photoUrl,
      position: exercise.position,
      createdAt: exercise.createdAt.toISOString(),
      updatedAt: exercise.updatedAt.toISOString(),
    })),
  };
}
