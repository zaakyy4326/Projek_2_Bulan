IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_friends')
BEGIN
    CREATE TABLE user_friends (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL FOREIGN KEY REFERENCES users(user_id),
        friend_user_id INT NOT NULL FOREIGN KEY REFERENCES users(user_id),
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT UQ_UserFriend UNIQUE(user_id, friend_user_id)
    );
END
GO
