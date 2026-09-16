-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" DATETIME
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    CONSTRAINT "Role_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" DATETIME,
    "authority" INTEGER NOT NULL DEFAULT 1,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "GuildProfile_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GuildProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timezone" TEXT NOT NULL DEFAULT '',
    "generationJoined" INTEGER NOT NULL DEFAULT 0,
    "weaponsMask" INTEGER NOT NULL DEFAULT 0,
    "platformsMask" INTEGER NOT NULL DEFAULT 0,
    "gamesMask" INTEGER NOT NULL DEFAULT 0,
    "customTitle" TEXT NOT NULL DEFAULT 'Ace Hunter',
    "customComment" TEXT NOT NULL DEFAULT '',
    "customColour" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "InGameAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "gameKey" TEXT NOT NULL,
    "platformKey" TEXT NOT NULL DEFAULT '',
    "baseScore" INTEGER NOT NULL DEFAULT 0,
    "expacScore" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    CONSTRAINT "InGameAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_guildId_key_key" ON "Role"("guildId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "GuildProfile_guildId_userId_key" ON "GuildProfile"("guildId", "userId");
