-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('WEIGHT', 'DURATION', 'DISTANCE_TIME', 'CHRONO');

-- AlterTable
ALTER TABLE "RoutineExercise"
ADD COLUMN "exerciseType" "ExerciseType" NOT NULL DEFAULT 'WEIGHT';

-- AlterTable
ALTER TABLE "TrainingSet"
ADD COLUMN "exerciseTypeSnapshot" "ExerciseType" NOT NULL DEFAULT 'WEIGHT',
ADD COLUMN "distanceMeters" DOUBLE PRECISION;
