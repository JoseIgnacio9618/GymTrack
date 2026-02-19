import { compare, hash } from "bcryptjs";
import { ExerciseType, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export interface RoutineExerciseInput {
  name: string;
  exerciseType: ExerciseType;
  description?: string | null;
  photoUrl?: string | null;
}

export interface RoutineInput {
  name: string;
  description?: string | null;
  exercises: RoutineExerciseInput[];
}

export interface RoutineExerciseRecord {
  id: string;
  routineId: string;
  name: string;
  exerciseType: ExerciseType;
  description: string | null;
  photoUrl: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineRecord {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  exercises: RoutineExerciseRecord[];
}

export interface TrainingSetRecord {
  id: string;
  trainingId: string;
  routineExerciseId: string | null;
  exerciseNameSnapshot: string;
  exerciseTypeSnapshot: ExerciseType;
  setNumber: number;
  weightKg: number | null;
  durationSec: number | null;
  distanceMeters: number | null;
  createdAt: Date;
  updatedAt: Date;
  routineExercisePhotoUrl: string | null;
}

export interface TrainingRecord {
  id: string;
  userId: string;
  routineId: string | null;
  routineNameSnapshot: string;
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sets: TrainingSetRecord[];
}

export interface TrainingStatsRecord {
  trainingsCount: number;
  totalSets: number;
  avgSetsPerTraining: number;
  avgWeightKg: number | null;
  avgDurationSec: number | null;
}

export interface ExerciseProgressStatsRecord {
  routineExerciseId: string;
  exerciseName: string;
  exerciseType: ExerciseType;
  totalSets: number;
  totalTrainings: number;
  avgSetsPerTraining: number;
  avgWeightKg: number | null;
  avgDurationSec: number | null;
  avgDistanceMeters: number | null;
}

const routineWithExercisesArgs = Prisma.validator<Prisma.RoutineDefaultArgs>()({
  include: {
    exercises: {
      orderBy: { position: "asc" },
    },
  },
});

const trainingWithSetsArgs = Prisma.validator<Prisma.TrainingDefaultArgs>()({
  include: {
    sets: {
      include: {
        routineExercise: {
          select: {
            id: true,
            photoUrl: true,
          },
        },
      },
      orderBy: [
        { exerciseNameSnapshot: "asc" },
        { setNumber: "asc" },
      ],
    },
  },
});

type RoutineWithExercises = Prisma.RoutineGetPayload<typeof routineWithExercisesArgs>;
type TrainingWithSets = Prisma.TrainingGetPayload<typeof trainingWithSetsArgs>;

type TrainingSetWithExercise = TrainingWithSets["sets"][number];

function toRecord(user: { id: string; name: string; email: string; passwordHash: string }): UserRecord {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
  };
}

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

function mapRoutineExercise(exercise: RoutineWithExercises["exercises"][number]): RoutineExerciseRecord {
  return {
    id: exercise.id,
    routineId: exercise.routineId,
    name: exercise.name,
    exerciseType: exercise.exerciseType,
    description: exercise.description,
    photoUrl: exercise.photoUrl,
    position: exercise.position,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt,
  };
}

function mapRoutine(routine: RoutineWithExercises): RoutineRecord {
  return {
    id: routine.id,
    userId: routine.userId,
    name: routine.name,
    description: routine.description,
    createdAt: routine.createdAt,
    updatedAt: routine.updatedAt,
    exercises: routine.exercises.map(mapRoutineExercise),
  };
}

function mapTrainingSet(set: TrainingSetWithExercise): TrainingSetRecord {
  return {
    id: set.id,
    trainingId: set.trainingId,
    routineExerciseId: set.routineExerciseId,
    exerciseNameSnapshot: set.exerciseNameSnapshot,
    exerciseTypeSnapshot: set.exerciseTypeSnapshot,
    setNumber: set.setNumber,
    weightKg: set.weightKg,
    durationSec: set.durationSec,
    distanceMeters: set.distanceMeters,
    createdAt: set.createdAt,
    updatedAt: set.updatedAt,
    routineExercisePhotoUrl: set.routineExercise?.photoUrl ?? null,
  };
}

function mapTraining(training: TrainingWithSets): TrainingRecord {
  return {
    id: training.id,
    userId: training.userId,
    routineId: training.routineId,
    routineNameSnapshot: training.routineNameSnapshot,
    startedAt: training.startedAt,
    endedAt: training.endedAt,
    createdAt: training.createdAt,
    updatedAt: training.updatedAt,
    sets: training.sets.map(mapTrainingSet),
  };
}

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<UserRecord> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new Error("EMAIL_EXISTS");

  const passwordHash = await hash(password.trim(), 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });
  return toRecord(user);
}

export async function findUserByEmailAndPassword(
  email: string,
  password: string
): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return null;
  const ok = await compare(password.trim(), user.passwordHash);
  return ok ? toRecord(user) : null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toRecord(user) : null;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  return user ? toRecord(user) : null;
}

export async function listUsers(email?: string): Promise<UserRecord[]> {
  const users = email
    ? await prisma.user.findMany({
        where: { email: email.trim().toLowerCase() },
      })
    : await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return users.map(toRecord);
}

/**
 * Restaura un usuario con un id dado (p. ej. desde backup del cliente).
 */
export async function restoreUser(
  id: string,
  name: string,
  email: string,
  password: string
): Promise<UserRecord | null> {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (existing) return toRecord(existing);

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = password.trim()
    ? await hash(password.trim(), 10)
    : await hash(id + "-backup", 10);

  const user = await prisma.user.create({
    data: {
      id,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });
  return toRecord(user);
}

export async function createRoutine(userId: string, input: RoutineInput): Promise<RoutineRecord> {
  const routine = await prisma.routine.create({
    data: {
      userId,
      name: normalizeText(input.name),
      description: normalizeOptionalText(input.description),
      exercises: {
        create: input.exercises.map((exercise, index) => ({
          name: normalizeText(exercise.name),
          exerciseType: exercise.exerciseType,
          description: normalizeOptionalText(exercise.description),
          photoUrl: normalizeOptionalText(exercise.photoUrl),
          position: index,
        })),
      },
    },
    ...routineWithExercisesArgs,
  });

  return mapRoutine(routine);
}

export async function listRoutinesByUser(userId: string): Promise<RoutineRecord[]> {
  const routines = await prisma.routine.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    ...routineWithExercisesArgs,
  });
  return routines.map(mapRoutine);
}

export async function findRoutineByIdForUser(routineId: string, userId: string): Promise<RoutineRecord | null> {
  const routine = await prisma.routine.findFirst({
    where: {
      id: routineId,
      userId,
    },
    ...routineWithExercisesArgs,
  });

  return routine ? mapRoutine(routine) : null;
}

export async function updateRoutine(
  routineId: string,
  userId: string,
  input: RoutineInput
): Promise<RoutineRecord | null> {
  const existing = await prisma.routine.findFirst({
    where: { id: routineId, userId },
    select: { id: true },
  });

  if (!existing) return null;

  const updated = await prisma.routine.update({
    where: { id: routineId },
    data: {
      name: normalizeText(input.name),
      description: normalizeOptionalText(input.description),
      exercises: {
        deleteMany: {},
        create: input.exercises.map((exercise, index) => ({
          name: normalizeText(exercise.name),
          exerciseType: exercise.exerciseType,
          description: normalizeOptionalText(exercise.description),
          photoUrl: normalizeOptionalText(exercise.photoUrl),
          position: index,
        })),
      },
    },
    ...routineWithExercisesArgs,
  });

  return mapRoutine(updated);
}

export async function deleteRoutine(routineId: string, userId: string): Promise<boolean> {
  const deleted = await prisma.routine.deleteMany({
    where: {
      id: routineId,
      userId,
    },
  });

  return deleted.count > 0;
}

export async function createTraining(userId: string, routineId: string): Promise<TrainingRecord | null> {
  const routine = await prisma.routine.findFirst({
    where: {
      id: routineId,
      userId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!routine) return null;

  const training = await prisma.training.create({
    data: {
      userId,
      routineId: routine.id,
      routineNameSnapshot: routine.name,
    },
    ...trainingWithSetsArgs,
  });

  return mapTraining(training);
}

export async function findActiveTrainingByUser(userId: string): Promise<TrainingRecord | null> {
  const training = await prisma.training.findFirst({
    where: {
      userId,
      endedAt: null,
    },
    orderBy: {
      startedAt: "desc",
    },
    ...trainingWithSetsArgs,
  });

  return training ? mapTraining(training) : null;
}

export async function findTrainingByIdForUser(trainingId: string, userId: string): Promise<TrainingRecord | null> {
  const training = await prisma.training.findFirst({
    where: {
      id: trainingId,
      userId,
    },
    ...trainingWithSetsArgs,
  });

  return training ? mapTraining(training) : null;
}

export async function listTrainingsByUser(userId: string): Promise<TrainingRecord[]> {
  const trainings = await prisma.training.findMany({
    where: {
      userId,
    },
    orderBy: {
      startedAt: "desc",
    },
    ...trainingWithSetsArgs,
  });

  return trainings.map(mapTraining);
}

export async function addTrainingSet(
  trainingId: string,
  userId: string,
  routineExerciseId: string,
  weightKg: number | null,
  durationSec: number | null,
  distanceMeters: number | null
): Promise<TrainingSetRecord | null> {
  const training = await prisma.training.findFirst({
    where: {
      id: trainingId,
      userId,
    },
    select: {
      id: true,
      routineId: true,
      endedAt: true,
    },
  });

  if (!training || training.endedAt) return null;

  const exerciseWhere: Prisma.RoutineExerciseWhereInput = {
    id: routineExerciseId,
    routine: {
      userId,
    },
  };

  if (training.routineId) {
    exerciseWhere.routineId = training.routineId;
  }

  const exercise = await prisma.routineExercise.findFirst({
    where: exerciseWhere,
    select: {
      id: true,
      name: true,
      exerciseType: true,
      photoUrl: true,
    },
  });

  if (!exercise) return null;

  const normalizedWeightKg = weightKg && weightKg > 0 ? weightKg : null;
  const normalizedDurationSec = durationSec && durationSec > 0 ? Math.round(durationSec) : null;
  const normalizedDistanceMeters = distanceMeters && distanceMeters > 0 ? distanceMeters : null;

  if (
    exercise.exerciseType === ExerciseType.WEIGHT &&
    normalizedWeightKg === null
  ) {
    return null;
  }

  if (
    (exercise.exerciseType === ExerciseType.DURATION ||
      exercise.exerciseType === ExerciseType.CHRONO) &&
    normalizedDurationSec === null
  ) {
    return null;
  }

  if (
    exercise.exerciseType === ExerciseType.DISTANCE_TIME &&
    (normalizedDistanceMeters === null || normalizedDurationSec === null)
  ) {
    return null;
  }

  const currentSetCount = await prisma.trainingSet.count({
    where: {
      trainingId,
      routineExerciseId: exercise.id,
    },
  });

  const created = await prisma.trainingSet.create({
    data: {
      trainingId,
      routineExerciseId: exercise.id,
      exerciseNameSnapshot: exercise.name,
      exerciseTypeSnapshot: exercise.exerciseType,
      setNumber: currentSetCount + 1,
      weightKg: normalizedWeightKg,
      durationSec: normalizedDurationSec,
      distanceMeters: normalizedDistanceMeters,
    },
    include: {
      routineExercise: {
        select: {
          id: true,
          photoUrl: true,
        },
      },
    },
  });

  return {
    id: created.id,
    trainingId: created.trainingId,
    routineExerciseId: created.routineExerciseId,
    exerciseNameSnapshot: created.exerciseNameSnapshot,
    exerciseTypeSnapshot: created.exerciseTypeSnapshot,
    setNumber: created.setNumber,
    weightKg: created.weightKg,
    durationSec: created.durationSec,
    distanceMeters: created.distanceMeters,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    routineExercisePhotoUrl: created.routineExercise?.photoUrl ?? null,
  };
}

export async function completeTraining(trainingId: string, userId: string): Promise<TrainingRecord | null> {
  const existing = await prisma.training.findFirst({
    where: {
      id: trainingId,
      userId,
    },
    ...trainingWithSetsArgs,
  });

  if (!existing) return null;

  if (existing.endedAt) return mapTraining(existing);

  const completed = await prisma.training.update({
    where: {
      id: trainingId,
    },
    data: {
      endedAt: new Date(),
    },
    ...trainingWithSetsArgs,
  });

  return mapTraining(completed);
}

export async function getTrainingStatsByUser(userId: string): Promise<TrainingStatsRecord> {
  const trainingsCount = await prisma.training.count({
    where: {
      userId,
    },
  });

  const totalSets = await prisma.trainingSet.count({
    where: {
      training: {
        userId,
      },
    },
  });

  const weightAgg = await prisma.trainingSet.aggregate({
    where: {
      training: {
        userId,
      },
      weightKg: {
        not: null,
      },
    },
    _avg: {
      weightKg: true,
    },
  });

  const durationAgg = await prisma.trainingSet.aggregate({
    where: {
      training: {
        userId,
      },
      durationSec: {
        not: null,
      },
    },
    _avg: {
      durationSec: true,
    },
  });

  const avgSetsPerTraining = trainingsCount > 0 ? roundTo2(totalSets / trainingsCount) : 0;
  const avgWeightKg = weightAgg._avg.weightKg !== null ? roundTo2(weightAgg._avg.weightKg) : null;
  const avgDurationSec = durationAgg._avg.durationSec !== null ? roundTo2(durationAgg._avg.durationSec) : null;

  return {
    trainingsCount,
    totalSets,
    avgSetsPerTraining,
    avgWeightKg,
    avgDurationSec,
  };
}

export async function getExerciseProgressStatsForRoutine(
  userId: string,
  routineId: string
): Promise<ExerciseProgressStatsRecord[] | null> {
  const routine = await prisma.routine.findFirst({
    where: {
      id: routineId,
      userId,
    },
    include: {
      exercises: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!routine) return null;

  const stats = await Promise.all(
    routine.exercises.map(async (exercise) => {
      const baseWhere: Prisma.TrainingSetWhereInput = {
        training: {
          userId,
        },
        OR: [
          { routineExerciseId: exercise.id },
          {
            exerciseNameSnapshot: exercise.name,
            exerciseTypeSnapshot: exercise.exerciseType,
          },
        ],
      };

      const totalSets = await prisma.trainingSet.count({
        where: baseWhere,
      });

      const groupedTrainings = await prisma.trainingSet.findMany({
        where: baseWhere,
        select: {
          trainingId: true,
        },
        distinct: ["trainingId"],
      });

      const aggregates = await prisma.trainingSet.aggregate({
        where: baseWhere,
        _avg: {
          weightKg: true,
          durationSec: true,
          distanceMeters: true,
        },
      });

      const totalTrainings = groupedTrainings.length;
      const avgSetsPerTraining =
        totalTrainings > 0 ? roundTo2(totalSets / totalTrainings) : 0;

      return {
        routineExerciseId: exercise.id,
        exerciseName: exercise.name,
        exerciseType: exercise.exerciseType,
        totalSets,
        totalTrainings,
        avgSetsPerTraining,
        avgWeightKg:
          aggregates._avg.weightKg !== null
            ? roundTo2(aggregates._avg.weightKg)
            : null,
        avgDurationSec:
          aggregates._avg.durationSec !== null
            ? roundTo2(aggregates._avg.durationSec)
            : null,
        avgDistanceMeters:
          aggregates._avg.distanceMeters !== null
            ? roundTo2(aggregates._avg.distanceMeters)
            : null,
      };
    })
  );

  return stats;
}
