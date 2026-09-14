-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timezone" TEXT NOT NULL DEFAULT '',
    "customColour" INTEGER NOT NULL DEFAULT 0,
    "authorityLevel" INTEGER NOT NULL DEFAULT 1,
    "customTitle" TEXT NOT NULL DEFAULT 'Ace Hunter',
    "customComment" TEXT NOT NULL DEFAULT '',
    "inGameName" TEXT NOT NULL DEFAULT '',
    "inGameId" TEXT NOT NULL DEFAULT '',
    "gameBaseScore" INTEGER NOT NULL DEFAULT 0,
    "gameExpacScore" INTEGER NOT NULL DEFAULT 0,
    "generation" INTEGER NOT NULL DEFAULT 0,
    "weaponsBitmask" INTEGER NOT NULL DEFAULT 0,
    "platformsBitmask" INTEGER NOT NULL DEFAULT 0,
    "gamesBitmask" INTEGER NOT NULL DEFAULT 0,
    "guildId" TEXT NOT NULL,
    CONSTRAINT "Profile_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defaultAuthority" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "AppRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roleId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    CONSTRAINT "AppRole_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
