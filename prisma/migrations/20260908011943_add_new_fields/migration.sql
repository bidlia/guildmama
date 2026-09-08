/*
  Warnings:

  - You are about to drop the column `GamesBitmask` on the `Profile` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timezone" TEXT NOT NULL DEFAULT '',
    "customColour" INTEGER NOT NULL DEFAULT 0,
    "authorityLevel" INTEGER NOT NULL DEFAULT 1,
    "inGameName" TEXT NOT NULL DEFAULT '',
    "customTitle" TEXT NOT NULL DEFAULT 'Ace Hunter',
    "customComment" TEXT NOT NULL DEFAULT '',
    "generation" INTEGER NOT NULL DEFAULT 0,
    "weaponsBitmask" INTEGER NOT NULL DEFAULT 0,
    "platformsBitmask" INTEGER NOT NULL DEFAULT 0,
    "gamesBitmask" INTEGER NOT NULL DEFAULT 0,
    "guildId" TEXT NOT NULL,
    CONSTRAINT "Profile_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("authorityLevel", "createdAt", "customColour", "customComment", "customTitle", "generation", "guildId", "id", "inGameName", "platformsBitmask", "timezone", "weaponsBitmask") SELECT "authorityLevel", "createdAt", "customColour", "customComment", "customTitle", "generation", "guildId", "id", "inGameName", "platformsBitmask", "timezone", "weaponsBitmask" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
