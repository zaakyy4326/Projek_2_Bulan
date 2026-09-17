USE [UAS]
GO

-- 1. Tambahkan kolom xp, level, dan play_time_seconds ke tabel users jika belum ada
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = N'xp')
BEGIN
    ALTER TABLE [dbo].[users] ADD [xp] INT NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = N'level')
BEGIN
    ALTER TABLE [dbo].[users] ADD [level] INT NOT NULL DEFAULT 1;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = N'play_time_seconds')
BEGIN
    ALTER TABLE [dbo].[users] ADD [play_time_seconds] INT NOT NULL DEFAULT 0;
END
GO

-- 2. Buat tabel UserDailyMissions jika belum ada
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserDailyMissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserDailyMissions](
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserId] INT NOT NULL,
        [SlotNumber] INT NOT NULL,
        [MissionType] VARCHAR(50) NOT NULL,
        [MenuName] VARCHAR(50) NULL,
        [TargetProgress] INT NOT NULL,
        [CurrentProgress] INT NOT NULL DEFAULT 0,
        [IsCompleted] BIT NOT NULL DEFAULT 0,
        [IsClaimed] BIT NOT NULL DEFAULT 0,
        [AssignedDate] DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        CONSTRAINT [FK_UserDailyMissions_Users] FOREIGN KEY([UserId]) REFERENCES [dbo].[users] ([user_id]) ON DELETE CASCADE
    );
END
GO

-- 3. Buat tabel UserAchievements jika belum ada
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserAchievements]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserAchievements](
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserId] INT NOT NULL,
        [AchievementKey] VARCHAR(50) NOT NULL,
        [UnlockedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [IsPinned] BIT NOT NULL DEFAULT 0,
        [IsClaimed] BIT NOT NULL DEFAULT 0,
        CONSTRAINT [FK_UserAchievements_Users] FOREIGN KEY([UserId]) REFERENCES [dbo].[users] ([user_id]) ON DELETE CASCADE
    );
END
GO
