-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'DONE';

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "bins" DROP NOT NULL;
