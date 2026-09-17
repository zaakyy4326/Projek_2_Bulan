-- SCRIPT PEMBUATAN TABEL DAN DATA AWAL KYU DESSERT SHOP
-- Database: UAS / GameDbContext

-- 1. Tabel ShopCategories
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ShopCategories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ShopCategories] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL,
        [Slug] NVARCHAR(100) NOT NULL,
        [IconEmoji] NVARCHAR(20) NULL,
        [Description] NVARCHAR(255) NULL,
        [DisplayOrder] INT NOT NULL DEFAULT 0,
        [IsActive] BIT NOT NULL DEFAULT 1
    );
END
GO

-- 2. Tabel ShopProducts
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ShopProducts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ShopProducts] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [CategoryId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[ShopCategories]([Id]),
        [Name] NVARCHAR(150) NOT NULL,
        [Slug] NVARCHAR(150) NOT NULL,
        [ShortDescription] NVARCHAR(255) NULL,
        [FullDescription] NVARCHAR(MAX) NULL,
        [Price] DECIMAL(18,2) NOT NULL,
        [OriginalPrice] DECIMAL(18,2) NULL,
        [ImageUrl] NVARCHAR(500) NOT NULL,
        [Rating] DECIMAL(3,1) NOT NULL DEFAULT 5.0,
        [TotalReviews] INT NOT NULL DEFAULT 0,
        [TotalSold] INT NOT NULL DEFAULT 0,
        [Stock] INT NOT NULL DEFAULT 50,
        [BadgeText] NVARCHAR(50) NULL,
        [IsFeatured] BIT NOT NULL DEFAULT 0,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 3. Tabel ShopProductVariants
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ShopProductVariants]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ShopProductVariants] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [ProductId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[ShopProducts]([Id]) ON DELETE CASCADE,
        [VariantType] NVARCHAR(50) NOT NULL,
        [VariantName] NVARCHAR(100) NOT NULL,
        [ExtraPrice] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [IsDefault] BIT NOT NULL DEFAULT 0
    );
END
GO

-- 4. Tabel ShopCartItems
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ShopCartItems]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ShopCartItems] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [UserId] INT NOT NULL,
        [ProductId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[ShopProducts]([Id]) ON DELETE CASCADE,
        [SelectedVariant] NVARCHAR(255) NULL,
        [Quantity] INT NOT NULL DEFAULT 1,
        [CustomNote] NVARCHAR(255) NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 5. Tabel ShopOrders
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ShopOrders]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ShopOrders] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [OrderCode] NVARCHAR(50) NOT NULL UNIQUE,
        [UserId] INT NOT NULL,
        [RecipientName] NVARCHAR(100) NOT NULL,
        [RecipientPhone] NVARCHAR(30) NOT NULL,
        [DeliveryAddress] NVARCHAR(500) NOT NULL,
        [DeliveryNotes] NVARCHAR(255) NULL,
        [ShippingMethod] NVARCHAR(50) NOT NULL,
        [ShippingCost] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [DeliveryDate] DATETIME NULL,
        [DeliveryTimeSlot] NVARCHAR(50) NULL,
        [SubTotal] DECIMAL(18,2) NOT NULL,
        [DiscountAmount] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [VoucherCode] NVARCHAR(50) NULL,
        [GrandTotal] DECIMAL(18,2) NOT NULL,
        [PaymentMethod] NVARCHAR(50) NOT NULL,
        [PaymentStatus] NVARCHAR(30) NOT NULL DEFAULT 'Pending',
        [OrderStatus] NVARCHAR(30) NOT NULL DEFAULT 'Pending_Payment',
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [PaidAt] DATETIME NULL,
        [CompletedAt] DATETIME NULL
    );
END
GO

-- 6. Tabel ShopOrderItems
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ShopOrderItems]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ShopOrderItems] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [OrderId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[ShopOrders]([Id]) ON DELETE CASCADE,
        [ProductId] INT NOT NULL,
        [ProductName] NVARCHAR(150) NOT NULL,
        [ProductImage] NVARCHAR(500) NOT NULL,
        [VariantName] NVARCHAR(255) NULL,
        [Price] DECIMAL(18,2) NOT NULL,
        [Quantity] INT NOT NULL,
        [SubTotal] DECIMAL(18,2) NOT NULL,
        [CustomNote] NVARCHAR(255) NULL
    );
END
GO

-- 7. Tabel ShopProductReviews
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ShopProductReviews]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ShopProductReviews] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [ProductId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[ShopProducts]([Id]),
        [OrderId] INT NULL,
        [UserId] INT NOT NULL,
        [Rating] INT NOT NULL DEFAULT 5,
        [Comment] NVARCHAR(MAX) NOT NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 8. Tabel ShopVouchers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ShopVouchers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ShopVouchers] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Code] NVARCHAR(50) NOT NULL UNIQUE,
        [Name] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(255) NULL,
        [DiscountType] NVARCHAR(30) NOT NULL, -- PERCENT, FIXED, FREE_SHIPPING
        [DiscountValue] DECIMAL(18,2) NOT NULL,
        [MinSpend] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [MaxDiscount] DECIMAL(18,2) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1
    );
END
GO

-- SEED DATA CATEGORIES
IF NOT EXISTS (SELECT 1 FROM [dbo].[ShopCategories])
BEGIN
    INSERT INTO [dbo].[ShopCategories] ([Name], [Slug], [IconEmoji], [Description], [DisplayOrder], [IsActive])
    VALUES 
    (N'Cakes & Tarts', N'cakes-tarts', N'🎂', N'Kue tart ulang tahun, cheesecake lembut, & layer cakes premium.', 1, 1),
    (N'Artisan Pastry', N'artisan-pastry', N'🥐', N'Pastry renyah dipanggang fresh tiap pagi dengan butter prancis.', 2, 1),
    (N'Cookies & Macarons', N'cookies-macarons', N'🍪', N'Macaron warna-warni khas Paris & soft baked chunky cookies.', 3, 1),
    (N'Pudding & Cups', N'pudding-cups', N'🍮', N'Dessert cup praktis, tiramisu lumer, & puding karamel sutra.', 4, 1),
    (N'Gelato & Cold', N'gelato-cold', N'🍨', N'Gelato artisan kaya rasa & mochi ice cream kenyal menyegarkan.', 5, 1),
    (N'Hampers & Gifts', N'hampers-gift', N'🎁', N'Paket bingkisan manis lengkap dengan kartu ucapan kustom.', 6, 1);
END
GO

-- SEED DATA VOUCHERS
IF NOT EXISTS (SELECT 1 FROM [dbo].[ShopVouchers])
BEGIN
    INSERT INTO [dbo].[ShopVouchers] ([Code], [Name], [Description], [DiscountType], [DiscountValue], [MinSpend], [MaxDiscount], [IsActive])
    VALUES 
    (N'DK-ONGKIR10', N'Voucher Gratis Ongkir Rp 10.000', N'Hadiah Achievement Chef Magang. Potongan ongkir hemat!', N'FREE_SHIPPING', 10000, 30000, 10000, 1),
    (N'DK-KUE15K', N'Voucher Diskon Belanja Rp 15.000', N'Hadiah Achievement Master Pastry. Potongan langsung Rp 15rb!', N'FIXED', 15000, 50000, NULL, 1),
    (N'DK-CLOSE5K', N'Voucher Manis Rp 5.000', N'Hadiah Achievement So Close. Diskon ekstra setiap belanja!', N'FIXED', 5000, 20000, NULL, 1),
    (N'DK-SETIA50K', N'Voucher Pelanggan Setia Rp 50.000', N'Hadiah Achievement Pelanggan Setia (Playtime). Diskon jumbo!', N'FIXED', 50000, 120000, NULL, 1),
    (N'DK-STAR10K', N'Voucher Bintang Kejora Rp 10.000', N'Hadiah Bintang Kejora Petualangan. Potongan belanja manis!', N'FIXED', 10000, 40000, NULL, 1),
    (N'DK-DEWA30K', N'Voucher Dewa Dessert Rp 30.000', N'Hadiah Penakluk Semua Level Petualangan. Diskon spesial Rp 30rb!', N'FIXED', 30000, 80000, NULL, 1),
    (N'DK-BLOK20', N'Voucher Raja Blok Rp 20.000', N'Hadiah High Score Puzzle Raja Blok. Potongan harga Rp 20rb!', N'FIXED', 20000, 60000, NULL, 1),
    (N'KYUWELCOME', N'Diskon Selamat Datang 15%', N'Diskon pembeli baru 15% hingga Rp 25.000!', N'PERCENT', 15, 30000, 25000, 1),
    (N'KYUMANIS', N'Diskon Manis Rp 10.000', N'Potongan belanja Rp 10.000 minimum order Rp 40.000', N'FIXED', 10000, 40000, NULL, 1);
END
GO

-- SEED DATA PRODUCTS & VARIANTS
IF NOT EXISTS (SELECT 1 FROM [dbo].[ShopProducts])
BEGIN
    -- 1. Matcha Basque Cheesecake (Cat 1)
    INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
    VALUES (1, N'Kyu Signature Matcha Basque Cheesecake', N'kyu-matcha-basque-cheesecake', 
    N'Cheesecake basque lembut dengan Uji matcha murni dan burnt caramel crust yang harum.',
    N'Kombinasi sempurna antara cream cheese premium New Zealand dengan bubuk Uji Matcha autentik dari Kyoto. Memiliki tekstur tengah yang melted creamy dengan lapisan atas gosong karamel yang khas. Sangat cocok dinikmati dingin bersama teh hangat.',
    165000, 185000, N'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80', 4.9, 128, 340, 45, N'Best Seller', 1, 1);
    
    DECLARE @p1 INT = SCOPE_IDENTITY();
    INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
    (@p1, N'Ukuran', N'Slice Standar', 0, 1),
    (@p1, N'Ukuran', N'Whole Cake 16cm (+Rp 85.000)', 85000, 0),
    (@p1, N'Ukuran', N'Whole Cake 20cm (+Rp 145.000)', 145000, 0),
    (@p1, N'Level Gula', N'Normal Sweetness (100%)', 0, 1),
    (@p1, N'Level Gula', N'Less Sugar (50%)', 0, 0);

    -- 2. Belgian Dark Truffle Cake (Cat 1)
    INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
    VALUES (1, N'Belgian Dark Chocolate Truffle Cake', N'belgian-dark-chocolate-truffle-cake',
    N'Kue cokelat Belgia 70% intens dengan lapisan ganache silky dan taburan cacao nibs.',
    N'Dibuat khusus untuk para pecinta cokelat sejati. Terdiri dari sponge cokelat moist, dilapisi ganache dark chocolate Belgia pekat dengan rasa pahit manis yang mewah dan seimbang.',
    175000, 195000, N'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', 5.0, 94, 210, 30, N'Chef Choice', 1, 1);

    DECLARE @p2 INT = SCOPE_IDENTITY();
    INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
    (@p2, N'Ukuran', N'Slice Standar', 0, 1),
    (@p2, N'Ukuran', N'Whole Cake 16cm (+Rp 90.000)', 90000, 0),
    (@p2, N'Ukuran', N'Whole Cake 20cm (+Rp 155.000)', 155000, 0);

    -- 3. Strawberry Blossom Shortcake (Cat 1)
    INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
    VALUES (1, N'Japanese Strawberry Blossom Shortcake', N'japanese-strawberry-blossom-shortcake',
    N'Sponge cake vanilla super ringan dengan chantilly cream segar dan buah stroberi impor.',
    N'Kue shortcake ala Jepang dengan kelembutan bolu awan yang menyatu dengan krim kocok segar dan potongan stroberi manis asam yang melimpah di setiap gigitan.',
    145000, 160000, N'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80', 4.8, 87, 195, 25, N'Popular', 1, 1);

    DECLARE @p3 INT = SCOPE_IDENTITY();
    INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
    (@p3, N'Ukuran', N'Slice Standar', 0, 1),
    (@p3, N'Ukuran', N'Whole Cake 16cm (+Rp 80.000)', 80000, 0);

    -- 4. French Butter Croissant (Cat 2)
    INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
    VALUES (2, N'French Butter Croissant (Box of 3)', N'french-butter-croissant-box',
    N'Croissant lumer berlapis dengan butter Prancis AOP. Garing di luar dan sarang lebah di dalam.',
    N'Dipanggang fresh setiap subuh menggunakan 100% Elle & Vire French Butter. Proses fermentasi lambat 24 jam menghasilkan aroma mentega harum semerbak dengan lapisan luar super crispy.',
    48000, NULL, N'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80', 4.9, 150, 520, 80, N'Fresh Daily', 1, 1);

    -- 5. Pistachio Cream Cruffin (Cat 2)
    INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
    VALUES (2, N'Pistachio Cream Cruffin Supreme', N'pistachio-cream-cruffin',
    N'Perpaduan croissant & muffin dengan isian pistachio diplomat cream melimpah.',
    N'Adonan pastry flaky dibentuk layaknya muffin, kemudian diisi dengan custard pistachio panggang yang gurih manis dan ditaburi cacahan kacang pistachio di puncaknya.',
    38000, NULL, N'https://images.unsplash.com/photo-1621236378699-8597faf6a173?auto=format&fit=crop&w=600&q=80', 4.8, 42, 110, 35, N'New', 0, 1);

    -- 6. Kyu Parisian Macarons (Cat 3)
    INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
    VALUES (3, N'Kyu Parisian Macarons (Gift Box of 6)', N'kyu-parisian-macarons-box-6',
    N'Macaron Prancis dengan shell almond renyah kenyal dan aneka ganache premium.',
    N'Satu box berisi 6 rasa pilihan: Salted Caramel, Earl Grey Lavender, Rose Raspberry, Pistachio Delight, Dark Truffle, dan Lemon Curd.',
    85000, 95000, N'https://images.unsplash.com/photo-1569864321397-6a1e505bf777?auto=format&fit=crop&w=600&q=80', 5.0, 215, 640, 60, N'Best Seller', 1, 1);

    DECLARE @p6 INT = SCOPE_IDENTITY();
    INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
    (@p6, N'Paket', N'Box of 6 Pcs', 0, 1),
    (@p6, N'Paket', N'Deluxe Box of 12 Pcs (+Rp 75.000)', 75000, 0);

    -- 7. Soft Baked NYC Dark Choco Cookie (Cat 3)
    INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
    VALUES (3, N'Soft Baked NYC Dark Choco & Walnut Cookie', N'soft-baked-nyc-cookie',
    N'Cookie tebal gaya New York yang crunchy di tepi dan gooey meleleh di tengah.',
    N'Menggunakan dark chocolate chunks melimpah dan renyahnya kacang walnut panggang. Nikmati selagi hangat untuk sensasi cokelat lumer yang menggoda.',
    28000, NULL, N'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80', 4.9, 180, 490, 70, NULL, 0, 1);

    -- 8. Royal Tiramisu Cup (Cat 4)
    INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
    VALUES (4, N'Royal Tiramisu Cup with Savoiardi', N'royal-tiramisu-cup',
    N'Tiramisu klasik Italia dengan biskuit Savoiardi berendam espresso & mascarpone zabaglione.',
    N'Dibuat dengan keju mascarpone impor asli, espresso robusta-arabica racikan khusus, dan taburan cokelat bubuk Valrhona murni tanpa gelatin.',
    42000, NULL, N'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', 5.0, 130, 380, 50, N'Chef Choice', 1, 1);

    -- 9. Silky Japanese Caramel Custard Pudding (Cat 4)
    INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
    VALUES (4, N'Silky Japanese Caramel Custard Pudding', N'silky-caramel-custard-pudding',
    N'Puding karamel sutra khas Tokyo dengan saus karamel wangi sedikit pahit yang elegan.',
    N'Teksturnya begitu lembut hingga meleleh di lidah, dibuat dari susu segar berkualitas tinggi, telur omega-3, dan ekstrak vanilla Bourbon murni.',
    32000, NULL, N'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80', 4.9, 95, 310, 40, NULL, 0, 1);

    -- 10. Earl Grey Lavender Gelato Pint (Cat 5)
    INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
    VALUES (5, N'Artisan Earl Grey Lavender Gelato Pint (473ml)', N'earl-grey-lavender-gelato-pint',
    N'Gelato lembut beraroma teh Earl Grey bergamot dengan sentuhan bunga lavender.',
    N'Gelato rendah lemak khas Italia dengan tekstur super padat dan creamy. Dikirim dengan packaging insulated bag dan ice pack agar tetap beku sempurna.',
    88000, NULL, N'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', 4.9, 82, 240, 25, N'Must Try', 1, 1);

    -- 11. Kyu Deluxe Sweet Hampers (Cat 6)
    INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
    VALUES (6, N'Kyu Deluxe Sweet Hampers & Gift Box', N'kyu-deluxe-sweet-hampers',
    N'Paket hampers eksklusif berisi Mini Basque Cake, 4 Pastry, 6 Macarons & Custom Card.',
    N'Bingkisan paling berkesan untuk kado ulang tahun, anniversary, atau perayaan spesial. Dilengkapi hardbox premium bertali pita satin dan kartu ucapan kustom bertuliskan pesan Anda.',
    275000, 310000, N'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=600&q=80', 5.0, 48, 115, 20, N'Gift Special', 1, 1);
END
GO
