-- AlterTable
ALTER TABLE "ExecutionLog" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "cpuUsage" DOUBLE PRECISION,
ADD COLUMN     "execTime" DOUBLE PRECISION,
ADD COLUMN     "memoryUsage" DOUBLE PRECISION;
