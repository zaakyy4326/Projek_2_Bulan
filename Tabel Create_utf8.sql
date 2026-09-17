USE [UAS]
GO
/****** Object:  Table [dbo].[PuzzleLevels]    Script Date: 6/25/2026 1:30:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PuzzleLevels](
	[LevelId] [int] IDENTITY(1,1) NOT NULL,
	[LevelNumber] [int] NOT NULL,
	[TargetScore] [int] NOT NULL,
	[RewardCoins] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[RequiredStars] [int] NOT NULL,
	[RequiredRecipeId] [int] NULL,
	[IsBonusLevel] [bit] NOT NULL,
	[TargetDessertsJson] [nvarchar](max) NULL,
	[StarBlocksCount] [int] NOT NULL,
	[BoardLayoutJson] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[LevelId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RecipeIngredients]    Script Date: 6/25/2026 1:30:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecipeIngredients](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RecipeId] [int] NOT NULL,
	[IngredientName] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Recipes]    Script Date: 6/25/2026 1:30:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Recipes](
	[RecipeId] [int] IDENTITY(1,1) NOT NULL,
	[RecipeName] [varchar](50) NOT NULL,
	[UnlockCost] [int] NOT NULL,
	[CoinReward] [int] NOT NULL,
	[PackageType] [varchar](50) NOT NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RecipeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserPuzzleLevels]    Script Date: 6/25/2026 1:30:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserPuzzleLevels](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[LevelId] [int] NOT NULL,
	[HighScore] [int] NOT NULL,
	[Stars] [int] NOT NULL,
	[IsCompleted] [bit] NOT NULL,
	[CompletedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserRecipes]    Script Date: 6/25/2026 1:30:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserRecipes](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[RecipeId] [int] NOT NULL,
	[UnlockedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[users]    Script Date: 6/25/2026 1:30:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[users](
	[user_id] [int] IDENTITY(1,1) NOT NULL,
	[username] [varchar](50) NOT NULL,
	[password] [varchar](255) NOT NULL,
	[total_coins] [int] NULL,
	[high_score_bb] [int] NULL,
	[created_at] [datetime] NULL,
	[Email] [varchar](100) NULL,
	[OtpCode] [varchar](6) NULL,
	[avatar] [varchar](255) NULL,
	[last_username_change] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Users_Email] UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[PuzzleLevels] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[PuzzleLevels] ADD  DEFAULT ((0)) FOR [RequiredStars]
GO
ALTER TABLE [dbo].[PuzzleLevels] ADD  DEFAULT ((0)) FOR [IsBonusLevel]
GO
ALTER TABLE [dbo].[PuzzleLevels] ADD  DEFAULT ((2)) FOR [StarBlocksCount]
GO
ALTER TABLE [dbo].[Recipes] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[UserPuzzleLevels] ADD  DEFAULT ((0)) FOR [HighScore]
GO
ALTER TABLE [dbo].[UserPuzzleLevels] ADD  DEFAULT ((0)) FOR [Stars]
GO
ALTER TABLE [dbo].[UserPuzzleLevels] ADD  DEFAULT ((0)) FOR [IsCompleted]
GO
ALTER TABLE [dbo].[UserRecipes] ADD  DEFAULT (getdate()) FOR [UnlockedAt]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ((0)) FOR [total_coins]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ((0)) FOR [high_score_bb]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[RecipeIngredients]  WITH CHECK ADD  CONSTRAINT [FK_RecipeIngredients_Recipes] FOREIGN KEY([RecipeId])
REFERENCES [dbo].[Recipes] ([RecipeId])
GO
ALTER TABLE [dbo].[RecipeIngredients] CHECK CONSTRAINT [FK_RecipeIngredients_Recipes]
GO
ALTER TABLE [dbo].[UserPuzzleLevels]  WITH CHECK ADD  CONSTRAINT [FK_UserPuzzleLevels_PuzzleLevels] FOREIGN KEY([LevelId])
REFERENCES [dbo].[PuzzleLevels] ([LevelId])
GO
ALTER TABLE [dbo].[UserPuzzleLevels] CHECK CONSTRAINT [FK_UserPuzzleLevels_PuzzleLevels]
GO
ALTER TABLE [dbo].[UserPuzzleLevels]  WITH CHECK ADD  CONSTRAINT [FK_UserPuzzleLevels_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[UserPuzzleLevels] CHECK CONSTRAINT [FK_UserPuzzleLevels_Users]
GO
ALTER TABLE [dbo].[UserRecipes]  WITH CHECK ADD  CONSTRAINT [FK_UserRecipes_Recipe] FOREIGN KEY([RecipeId])
REFERENCES [dbo].[Recipes] ([RecipeId])
GO
ALTER TABLE [dbo].[UserRecipes] CHECK CONSTRAINT [FK_UserRecipes_Recipe]
GO
ALTER TABLE [dbo].[UserRecipes]  WITH CHECK ADD  CONSTRAINT [FK_UserRecipes_User] FOREIGN KEY([UserId])
REFERENCES [dbo].[users] ([user_id])
GO
ALTER TABLE [dbo].[UserRecipes] CHECK CONSTRAINT [FK_UserRecipes_User]
GO
