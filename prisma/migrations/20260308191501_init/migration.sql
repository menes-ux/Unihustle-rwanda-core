-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'business');

-- CreateEnum
CREATE TYPE "HustleStatus" AS ENUM ('open', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Hustle" (
    "hustle_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "HustleStatus" NOT NULL,
    "employer_id" INTEGER NOT NULL,

    CONSTRAINT "Hustle_pkey" PRIMARY KEY ("hustle_id")
);

-- CreateTable
CREATE TABLE "Application" (
    "app_id" SERIAL NOT NULL,
    "hustle_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("app_id")
);

-- CreateTable
CREATE TABLE "Review" (
    "review_id" SERIAL NOT NULL,
    "hustle_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("review_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Hustle" ADD CONSTRAINT "Hustle_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_hustle_id_fkey" FOREIGN KEY ("hustle_id") REFERENCES "Hustle"("hustle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hustle_id_fkey" FOREIGN KEY ("hustle_id") REFERENCES "Hustle"("hustle_id") ON DELETE RESTRICT ON UPDATE CASCADE;
