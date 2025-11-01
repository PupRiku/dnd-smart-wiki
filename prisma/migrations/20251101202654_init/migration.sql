-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "status" TEXT,
    "species" TEXT,
    "class" TEXT,
    "level" INTEGER,
    "hp" INTEGER,
    "ac" INTEGER,
    "originId" TEXT,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "foundingYear" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "status" TEXT,
    "founding" TEXT,
    "leaderId" TEXT,
    "headquartersId" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "rarity" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lore" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,

    CONSTRAINT "Lore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionSummary" (
    "id" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "title" TEXT,
    "inGameDate" TEXT,
    "recap" TEXT,
    "notableQuotes" TEXT[],
    "outline" TEXT,
    "notes" TEXT,

    CONSTRAINT "SessionSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CharacterToOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CharacterToOrganization_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CharacterToSessionSummary" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CharacterToSessionSummary_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LocationToSessionSummary" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LocationToSessionSummary_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ItemToSessionSummary" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItemToSessionSummary_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LoreToSessionSummary" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LoreToSessionSummary_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_key" ON "Character"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_leaderId_key" ON "Organization"("leaderId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lore_title_key" ON "Lore"("title");

-- CreateIndex
CREATE UNIQUE INDEX "SessionSummary_sessionNumber_key" ON "SessionSummary"("sessionNumber");

-- CreateIndex
CREATE INDEX "_CharacterToOrganization_B_index" ON "_CharacterToOrganization"("B");

-- CreateIndex
CREATE INDEX "_CharacterToSessionSummary_B_index" ON "_CharacterToSessionSummary"("B");

-- CreateIndex
CREATE INDEX "_LocationToSessionSummary_B_index" ON "_LocationToSessionSummary"("B");

-- CreateIndex
CREATE INDEX "_ItemToSessionSummary_B_index" ON "_ItemToSessionSummary"("B");

-- CreateIndex
CREATE INDEX "_LoreToSessionSummary_B_index" ON "_LoreToSessionSummary"("B");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_headquartersId_fkey" FOREIGN KEY ("headquartersId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToOrganization" ADD CONSTRAINT "_CharacterToOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToOrganization" ADD CONSTRAINT "_CharacterToOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToSessionSummary" ADD CONSTRAINT "_CharacterToSessionSummary_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToSessionSummary" ADD CONSTRAINT "_CharacterToSessionSummary_B_fkey" FOREIGN KEY ("B") REFERENCES "SessionSummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToSessionSummary" ADD CONSTRAINT "_LocationToSessionSummary_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToSessionSummary" ADD CONSTRAINT "_LocationToSessionSummary_B_fkey" FOREIGN KEY ("B") REFERENCES "SessionSummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToSessionSummary" ADD CONSTRAINT "_ItemToSessionSummary_A_fkey" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToSessionSummary" ADD CONSTRAINT "_ItemToSessionSummary_B_fkey" FOREIGN KEY ("B") REFERENCES "SessionSummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LoreToSessionSummary" ADD CONSTRAINT "_LoreToSessionSummary_A_fkey" FOREIGN KEY ("A") REFERENCES "Lore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LoreToSessionSummary" ADD CONSTRAINT "_LoreToSessionSummary_B_fkey" FOREIGN KEY ("B") REFERENCES "SessionSummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
