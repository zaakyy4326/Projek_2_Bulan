-- ==========================================================
-- SCRIPT MIGRATION: ADD SOFT DELETE COLUMNS
-- Tabel: ShopProducts & users
-- Memenuhi Ketentuan Pembuatan Projekan S1 (Soft Delete)
-- ==========================================================

USE [UAS_C#_Lanjutan];
GO

-- 1. Tambah kolom Soft Delete di tabel ShopProducts (jika belum ada)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.ShopProducts') AND name = 'IsDeleted'
)
BEGIN
    ALTER TABLE dbo.ShopProducts ADD IsDeleted BIT NOT NULL DEFAULT 0;
    PRINT 'Kolom IsDeleted berhasil ditambahkan ke ShopProducts.';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.ShopProducts') AND name = 'DeletedAt'
)
BEGIN
    ALTER TABLE dbo.ShopProducts ADD DeletedAt DATETIME NULL;
    PRINT 'Kolom DeletedAt berhasil ditambahkan ke ShopProducts.';
END
GO

-- 2. Tambah kolom Soft Delete di tabel users (jika belum ada)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.users') AND name = 'is_deleted'
)
BEGIN
    ALTER TABLE dbo.users ADD is_deleted BIT NOT NULL DEFAULT 0;
    PRINT 'Kolom is_deleted berhasil ditambahkan ke users.';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.users') AND name = 'deleted_at'
)
BEGIN
    ALTER TABLE dbo.users ADD deleted_at DATETIME NULL;
    PRINT 'Kolom deleted_at berhasil ditambahkan ke users.';
END
GO

PRINT 'Migrasi Soft Delete Selesai.';
GO
