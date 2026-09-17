-- SCRIPT RE-SEED 55 MENU DESSERT 100% VERIFIED ACCURATE
-- Database: UAS / GameDbContext

DELETE FROM [dbo].[ShopProductVariants];
DELETE FROM [dbo].[ShopProductReviews];
DELETE FROM [dbo].[ShopCartItems];
DELETE FROM [dbo].[ShopOrderItems];
DELETE FROM [dbo].[ShopProducts];
DELETE FROM [dbo].[ShopCategories];
GO

DBCC CHECKIDENT ('[dbo].[ShopCategories]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[ShopProducts]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[ShopProductVariants]', RESEED, 0);
GO

INSERT INTO [dbo].[ShopCategories] ([Name], [Slug], [IconEmoji], [Description], [DisplayOrder], [IsActive]) VALUES
(N'Cakes & Tarts', N'cakes-tarts', N'🎂', N'Kue tart ulang tahun, cheesecake lembut, & layer cakes premium.', 1, 1),
(N'Artisan Pastry', N'artisan-pastry', N'🥐', N'Pastry renyah dipanggang fresh tiap pagi dengan butter prancis.', 2, 1),
(N'Cookies & Macarons', N'cookies-macarons', N'🍪', N'Macaron warna-warni khas Paris & soft baked chunky cookies.', 3, 1),
(N'Pudding & Cups', N'pudding-cups', N'🍮', N'Dessert cup praktis, tiramisu lumer, & puding karamel sutra.', 4, 1),
(N'Gelato & Cold', N'gelato-cold', N'🍨', N'Gelato artisan kaya rasa & mochi ice cream kenyal menyegarkan.', 5, 1),
(N'Waffles & Treats', N'waffles-treats', N'🥞', N'Waffle Belgia renyah, churros kayu manis, & souffle pancake.', 6, 1),
(N'Hampers & Gifts', N'hampers-gift', N'🎁', N'Paket bingkisan manis lengkap dengan kartu ucapan kustom.', 7, 1);
GO

-- Product: Kyu Signature Matcha Basque Cheesecake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Kyu Signature Matcha Basque Cheesecake', N'kyu-matcha-basque-cheesecake', N'Cheesecake basque lembut dengan Uji matcha Kyoto murni dan burnt caramel crust yang harum.', N'Kombinasi sempurna antara cream cheese premium New Zealand dengan bubuk Uji Matcha autentik dari Kyoto. Memiliki tekstur tengah yang melted creamy dengan lapisan atas gosong karamel yang khas.', 165000, 185000, N'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80', 4.9, 142, 380, 45, N'Best Seller', 1, 1);
DECLARE @p1 INT = SCOPE_IDENTITY();
INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
(@p1, N'Ukuran', N'Slice Standar', 0, 1), (@p1, N'Ukuran', N'Whole Cake 16cm (+Rp 85.000)', 85000, 0), (@p1, N'Ukuran', N'Whole Cake 20cm (+Rp 145.000)', 145000, 0), (@p1, N'Level Gula', N'Normal Sweetness (100%)', 0, 1), (@p1, N'Level Gula', N'Less Sugar (50%)', 0, 0);
GO

-- Product: Belgian Dark Chocolate Truffle Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Belgian Dark Chocolate Truffle Cake', N'belgian-dark-chocolate-truffle-cake', N'Kue cokelat Belgia 70% intens dengan lapisan ganache silky dan taburan cacao nibs.', N'Dibuat khusus untuk para pecinta cokelat sejati. Terdiri dari sponge cokelat moist, dilapisi ganache dark chocolate Belgia pekat dengan rasa pahit manis yang mewah dan seimbang.', 175000, 195000, N'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', 5.0, 98, 230, 30, N'Chef Choice', 1, 1);
DECLARE @p2 INT = SCOPE_IDENTITY();
INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
(@p2, N'Ukuran', N'Slice Standar', 0, 1), (@p2, N'Ukuran', N'Whole Cake 16cm (+Rp 90.000)', 90000, 0), (@p2, N'Ukuran', N'Whole Cake 20cm (+Rp 155.000)', 155000, 0);
GO

-- Product: Japanese Strawberry Blossom Shortcake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Japanese Strawberry Blossom Shortcake', N'japanese-strawberry-blossom-shortcake', N'Sponge cake vanilla super ringan dengan chantilly cream segar dan buah stroberi impor.', N'Kue shortcake ala Jepang dengan kelembutan bolu awan yang menyatu dengan krim kocok segar dan potongan stroberi manis asam yang melimpah di setiap gigitan.', 145000, 160000, N'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80', 4.8, 89, 210, 25, N'Popular', 1, 1);
DECLARE @p3 INT = SCOPE_IDENTITY();
INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
(@p3, N'Ukuran', N'Slice Standar', 0, 1), (@p3, N'Ukuran', N'Whole Cake 16cm (+Rp 80.000)', 80000, 0);
GO

-- Product: Classic New York Baked Cheesecake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Classic New York Baked Cheesecake', N'classic-new-york-baked-cheesecake', N'Cheesecake panggang klasik yang padat dan creamy dengan selai wild berry asam manis.', N'Cheesecake gaya New York dengan dasar biskuit graham buttery dan isian krim keju panggang lembut bertekstur velvety yang kaya rasa.', 155000, 175000, N'https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=600&q=80', 4.9, 115, 310, 35, N'Best Seller', 1, 1);
GO

-- Product: Red Velvet Romance Layer Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Red Velvet Romance Layer Cake', N'red-velvet-romance-layer-cake', N'Cake merah lembut berpadu cream cheese frosting gurih asam dan taburan red velvet crumble.', N'Kue lapis merah memukau dengan aroma buttermilk cokelat ringan dan lapisan cream cheese frosting tebal yang gurih segar.', 140000, 160000, N'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80', 4.8, 76, 190, 40, NULL, 0, 1);
GO

-- Product: Lotus Biscoff Caramel Layer Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Lotus Biscoff Caramel Layer Cake', N'lotus-biscoff-caramel-layer-cake', N'Bolu karamel rempah dengan lelehan selai dan biskuit Lotus Biscoff renyah melimpah.', N'Setiap lapisannya diolesi selai Biscoff karamel rempah autentik dan ditutup dengan taburan biskuit speculoos yang crunchy.', 150000, 170000, N'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80', 4.9, 102, 280, 30, N'Popular', 0, 1);
GO

-- Product: French Mille-Feuille Vanilla Custard
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'French Mille-Feuille Vanilla Custard', N'french-mille-feuille-vanilla-custard', N'Puff pastry seribu lapis super renyah berhimpit krim custard vanila Bourbon lembut.', N'Kue klasik Prancis dengan tiga lapisan puff pastry karamelisasi garing diselingi diplomat vanilla cream yang manis elegan.', 48000, NULL, N'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80', 4.9, 64, 170, 25, N'Chef Choice', 0, 1);
GO

-- Product: Kyoto Matcha Mille Crepe Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Kyoto Matcha Mille Crepe Cake', N'kyoto-matcha-mille-crepe-cake', N'20 lapisan krep tipis lembut diselingi krim matcha Uji lumer yang harum semerbak.', N'Dibuat secara presisi lapis demi lapis krep beraroma teh hijau Kyoto murni dengan rasa manis yang pas dan lumer di mulut.', 160000, 180000, N'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80', 5.0, 88, 220, 20, N'Must Try', 1, 1);
GO

-- Product: Mango Passionfruit Tropical Mousse Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Mango Passionfruit Tropical Mousse Cake', N'mango-passionfruit-tropical-mousse-cake', N'Mousse tropis buah mangga harum & markisa segar yang ringan dengan jelly glaze berkilau.', N'Dessert menyegarkan dengan paduan rasa asam manis buah tropis alami di atas lapisan sponge cake vanila yang lembut.', 135000, 150000, N'https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=600&q=80', 4.8, 52, 140, 30, NULL, 0, 1);
GO

-- Product: Apple Cinnamon Butter Crumble Pie
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Apple Cinnamon Butter Crumble Pie', N'apple-cinnamon-butter-crumble-pie', N'Pai apel kayu manis panggang bermahkotakan butter crumble renyah gurih.', N'Pai hangat isi potongan apel Malang berpadu gula palem kayu manis harum dengan kulit pastry renyah bertabur crumble mentega.', 45000, NULL, N'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=600&q=80', 4.7, 43, 115, 35, NULL, 0, 1);
GO

-- Product: French Butter Croissant (Box of 3)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'French Butter Croissant (Box of 3)', N'french-butter-croissant-box-3', N'Croissant lumer berlapis dengan butter Prancis AOP. Garing di luar dan sarang lebah di dalam.', N'Dipanggang fresh setiap subuh menggunakan 100% Elle & Vire French Butter. Proses fermentasi lambat menghasilkan aroma mentega harum semerbak.', 48000, NULL, N'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80', 4.9, 165, 580, 80, N'Fresh Daily', 1, 1);
GO

-- Product: Pain au Chocolat Supreme
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Pain au Chocolat Supreme', N'pain-au-chocolat-supreme', N'Pastry garing berlapis mentega dengan 2 batangan dark chocolate Belgia meleleh di dalam.', N'Roti pastry cokelat klasik khas cafe Paris dengan lelehan cokelat Belgia murni berkualitas tinggi.', 35000, NULL, N'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=600&q=80', 4.9, 82, 270, 50, N'Popular', 1, 1);
GO

-- Product: Pistachio Cream Cruffin Supreme
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Pistachio Cream Cruffin Supreme', N'pistachio-cream-cruffin-supreme', N'Perpaduan croissant & muffin dengan isian pistachio diplomat cream melimpah.', N'Adonan pastry flaky dibentuk layaknya muffin, kemudian diisi dengan custard pistachio panggang yang gurih manis dan ditaburi cacahan kacang pistachio.', 38000, NULL, N'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80', 4.8, 55, 145, 40, N'New', 0, 1);
GO

-- Product: Almond Frangipane Twice-Baked Croissant
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Almond Frangipane Twice-Baked Croissant', N'almond-frangipane-croissant', N'Croissant dipanggang dua kali dengan isian krim almond frangipane dan taburan almond panggang.', N'Croissant manis berlapis krim kacang almond lembut dengan topping gula bubuk dan serpihan almond renyah.', 36000, NULL, N'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 4.9, 74, 210, 45, NULL, 0, 1);
GO

-- Product: Cinnamon Roll Supreme with Vanilla Glaze
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Cinnamon Roll Supreme with Vanilla Glaze', N'cinnamon-roll-supreme-glaze', N'Roti gulung kayu manis lembut harum mentega berbalut lelehan cream cheese vanilla glaze.', N'Kelezatan roti gulung lembut dengan paduan rempah kayu manis harum, gula aren, dan lelehan glaze keju vanila yang lumer.', 32000, NULL, N'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=600&q=80', 4.8, 92, 310, 60, N'Best Seller', 0, 1);
GO

-- Product: Kouign-Amann Caramelized Breton Pastry
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Kouign-Amann Caramelized Breton Pastry', N'kouign-amann-caramelized-pastry', N'Pastry mentega khas Brittany dengan lapisan karamel gula panggang renyah mengkilap.', N'Pastry tradisional Prancis dengan aroma mentega pekat dan kerak karamel manis yang crunchy di setiap gigitan.', 30000, NULL, N'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80', 4.9, 61, 180, 35, NULL, 0, 1);
GO

-- Product: Danish Strawberry Cream Cheese Pastry
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Danish Strawberry Cream Cheese Pastry', N'danish-strawberry-cream-cheese', N'Pastry buah renyah dengan vla cream cheese vanila dan potongan stroberi segar asam manis.', N'Kombinasi sempurna antara kelembutan krim keju manis dengan kesegaran buah stroberi di atas puff pastry gurih.', 34000, NULL, N'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=600&q=80', 4.8, 48, 130, 40, NULL, 0, 1);
GO

-- Product: Pain Aux Raisins (Custard Raisin Roll)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Pain Aux Raisins (Custard Raisin Roll)', N'pain-aux-raisins-custard-roll', N'Pastry ulir lembut berisi kismis manis juicy dan vanilla pastry cream yang harum.', N'Roti spiral khas Prancis dengan olesan custard vanila legit dan taburan kismis pilihan.', 30000, NULL, N'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80', 4.7, 39, 95, 30, NULL, 0, 1);
GO

-- Product: Smoked Beef & Melted Cheddar Croissant
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Smoked Beef & Melted Cheddar Croissant', N'smoked-beef-melted-cheddar-croissant', N'Croissant gurih isi irisan smoked beef premium dan keju cheddar leleh berlimpah.', N'Pilihan savory pastry lezat yang cocok untuk sarapan hangat atau camilan bergizi.', 38000, NULL, N'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80', 4.9, 87, 260, 45, N'Popular', 0, 1);
GO

-- Product: Kyu Parisian Macarons (Gift Box of 6)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Kyu Parisian Macarons (Gift Box of 6)', N'kyu-parisian-macarons-box-6', N'Macaron Prancis dalam gift box elegan dengan 6 aneka rasa ganache premium pilihan.', N'Satu box berisi 6 rasa pilihan: Salted Caramel, Earl Grey Lavender, Rose Raspberry, Pistachio Delight, Dark Truffle, dan Lemon Curd dalam packaging box hadiah cantik.', 85000, 95000, N'https://images.unsplash.com/photo-1558326567-98ae2405596b?auto=format&fit=crop&w=600&q=80', 5.0, 230, 690, 60, N'Best Seller', 1, 1);
DECLARE @p20 INT = SCOPE_IDENTITY();
INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
(@p20, N'Paket', N'Box of 6 Pcs', 0, 1), (@p20, N'Paket', N'Deluxe Box of 12 Pcs (+Rp 75.000)', 75000, 0);
GO

-- Product: Soft Baked NYC Dark Choco & Walnut Cookie
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Soft Baked NYC Dark Choco & Walnut Cookie', N'soft-baked-nyc-dark-choco-cookie', N'Cookie tebal gaya New York yang crunchy di tepi dan gooey meleleh di tengah.', N'Menggunakan dark chocolate chunks melimpah dan renyahnya kacang walnut panggang. Nikmati selagi hangat untuk sensasi cokelat lumer yang menggoda.', 28000, NULL, N'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80', 4.9, 195, 540, 70, N'Popular', 1, 1);
GO

-- Product: Red Velvet Cream Cheese Stuffed Cookie
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Red Velvet Cream Cheese Stuffed Cookie', N'red-velvet-cream-cheese-stuffed-cookie', N'Soft cookie red velvet dengan isian cream cheese manis gurih yang meleleh di tengah.', N'Adonan cookie merah beraroma vanila cokelat dengan lelehan kejunya yang lumer saat digigit.', 28000, NULL, N'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80', 4.8, 88, 240, 50, NULL, 0, 1);
GO

-- Product: Matcha White Choco Chunk Cookie
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Matcha White Choco Chunk Cookie', N'matcha-white-choco-chunk-cookie', N'Soft cookie teh hijau Uji matcha dengan bongkahan cokelat putih creamy manis.', N'Rasa earthy matcha yang autentik diimbangi dengan lelehan white chocolate Belgia yang creamy.', 28000, NULL, N'https://images.unsplash.com/photo-1490914327627-9fe8d52f4d90?auto=format&fit=crop&w=600&q=80', 4.9, 72, 210, 45, NULL, 0, 1);
GO

-- Product: Triple Belgian Chocolate Fudgy Cookie
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Triple Belgian Chocolate Fudgy Cookie', N'triple-belgian-chocolate-fudgy-cookie', N'Cookie cokelat pekat layaknya brownie dengan paduan dark, milk, dan white chocolate.', N'Sangat fudgy dan kaya rasa cokelat, dibuat khusus untuk memuaskan hasrat manis pecinta cokelat.', 28000, NULL, N'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80', 4.9, 105, 310, 60, N'Popular', 0, 1);
GO

-- Product: Vanilla Bean Craquelin Choux (Box of 4)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Vanilla Bean Craquelin Choux (Box of 4)', N'vanilla-bean-craquelin-choux-box', N'Kue sus renyah bermahkota krispi dengan isian krim vanilla diplomat melimpah.', N'Kulit sus garing dengan lapisan craquelin manis, diisi penuh dengan custard vanila dingin yang lumer.', 52000, NULL, N'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80', 4.8, 81, 230, 40, N'Must Try', 1, 1);
GO

-- Product: Dark Chocolate Ganache Parisian Eclair
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Dark Chocolate Ganache Parisian Eclair', N'dark-chocolate-ganache-eclair', N'Eclair panjang isi custard cokelat pekat dilapisi ganache dark chocolate berkilau.', N'Kue choux lonjong lembut berisi vla cokelat Belgia berlimpah dan dilapisi ganache mengkilap di atasnya.', 32000, NULL, N'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=600&q=80', 4.9, 63, 175, 35, NULL, 0, 1);
GO

-- Product: Canelé de Bordeaux (Box of 3)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Canelé de Bordeaux (Box of 3)', N'canele-de-bordeaux-box-3', N'Kue Prancis berkulit karamel garing beraroma vanila Bourbon dengan tekstur dalam custard kenyal.', N'Kue mungil tradisional Prancis yang dipanggang dalam cetakan tembaga hingga berkaramel pekat di luar namun lembut creamy di dalam.', 45000, NULL, N'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80', 5.0, 71, 190, 30, N'Chef Choice', 0, 1);
GO

-- Product: French Lemon Madeleine (Box of 5)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'French Lemon Madeleine (Box of 5)', N'french-lemon-madeleine-box-5', N'Kue kerang khas Prancis yang lembut beraroma butter harum dan kesegaran lemon zest.', N'Bolu mungil bentuk kerang dengan tekstur empuk ringan dan sedikit sentuhan glasir lemon tipis.', 38000, NULL, N'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', 4.8, 54, 150, 40, NULL, 0, 1);
GO

-- Product: Royal Italian Tiramisu Cup
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Royal Italian Tiramisu Cup', N'royal-italian-tiramisu-cup', N'Tiramisu klasik Italia dengan biskuit Savoiardi berendam espresso & keju mascarpone zabaglione.', N'Dibuat dengan keju mascarpone impor asli, espresso robusta-arabica racikan khusus, dan taburan cokelat bubuk Valrhona murni tanpa gelatin.', 42000, NULL, N'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', 5.0, 145, 420, 50, N'Chef Choice', 1, 1);
GO

-- Product: Silky Japanese Caramel Custard Pudding
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Silky Japanese Caramel Custard Pudding', N'silky-caramel-custard-pudding', N'Puding karamel sutra khas Tokyo dengan saus karamel wangi sedikit pahit yang elegan.', N'Teksturnya begitu lembut hingga meleleh di lidah, dibuat dari susu segar berkualitas tinggi, telur omega-3, dan ekstrak vanilla Bourbon murni.', 32000, NULL, N'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=600&q=80', 4.9, 102, 340, 40, N'Best Seller', 0, 1);
GO

-- Product: Mango Sago Coconut Panna Cotta Cup
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Mango Sago Coconut Panna Cotta Cup', N'mango-sago-coconut-panna-cotta', N'Panna cotta lembut berpadu puree mangga harum dan sagu mutiara kenyal menyegarkan.', N'Dessert cup dingin berlapis panna cotta krim kelapa gurih dan buah mangga manis alami.', 36000, NULL, N'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', 4.8, 59, 160, 35, NULL, 0, 1);
GO

-- Product: Lotus Biscoff Cheesecake Jar
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Lotus Biscoff Cheesecake Jar', N'lotus-biscoff-cheesecake-jar', N'Cheesecake dingin praktis dalam jar kaca dengan remahan biskuit dan selai karamel Biscoff.', N'Kombinasi cream cheese dingin gurih dengan remahan renyah biskuit speculoos karamel dalam kemasan jar kaca estetik.', 38000, NULL, N'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80', 4.9, 78, 220, 35, N'Popular', 0, 1);
GO

-- Product: Belgian Warm Chocolate Lava Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Belgian Warm Chocolate Lava Cake', N'belgian-warm-chocolate-lava-cake', N'Cake cokelat hangat dengan lelehan saus cokelat pekat mengalir lumer saat disendok.', N'Kue cokelat panggang dengan lelehan inti cokelat cair yang lumer. Cukup dihangatkan 15 detik di microwave.', 38000, NULL, N'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', 4.9, 93, 275, 30, N'Must Try', 1, 1);
GO

-- Product: Classic Vanilla Bean Crème Brûlée
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Classic Vanilla Bean Crème Brûlée', N'classic-vanilla-bean-creme-brulee', N'Custard vanila lembut dengan lapisan gula bakar karamel yang renyah saat dipecahkan.', N'Dessert klasik Prancis dengan sensasi memecahkan kerak gula karamel garing sebelum menyendok custard lembutnya.', 35000, NULL, N'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80', 4.8, 67, 190, 25, NULL, 0, 1);
GO

-- Product: Strawberry Peach Jelly Panna Cotta
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Strawberry Peach Jelly Panna Cotta', N'strawberry-peach-jelly-panna-cotta', N'Panna cotta vanila dua lapis dengan jelly buah persik dan stroberi manis segar.', N'Panna cotta lembut dipadukan dengan jelly buah transparan yang cantik dan menyegarkan dahaga.', 34000, NULL, N'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', 4.7, 41, 110, 30, NULL, 0, 1);
GO

-- Product: Dark Chocolate Silk Mousse Cup
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Dark Chocolate Silk Mousse Cup', N'dark-chocolate-silk-mousse-cup', N'Mousse cokelat Belgia super lembut bertekstur udara dengan taburan cocoa nibs.', N'Mousse ringan dan lumer di mulut yang dibuat dari cokelat hitam 70% dan whipped cream segar.', 36000, NULL, N'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80', 4.8, 56, 155, 30, NULL, 0, 1);
GO

-- Product: Artisan Earl Grey Lavender Gelato Pint (473ml)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Artisan Earl Grey Lavender Gelato Pint (473ml)', N'earl-grey-lavender-gelato-pint', N'Gelato lembut beraroma teh Earl Grey bergamot dengan sentuhan bunga lavender.', N'Gelato rendah lemak khas Italia dengan tekstur super padat dan creamy. Dikirim dengan packaging insulated bag dan ice pack.', 88000, NULL, N'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', 4.9, 94, 260, 25, N'Must Try', 1, 1);
GO

-- Product: Roasted Sicilian Pistachio Gelato Pint (473ml)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Roasted Sicilian Pistachio Gelato Pint (473ml)', N'roasted-sicilian-pistachio-gelato', N'Gelato pistachio panggang autentik Italia yang kaya rasa, nutty, dan creamy.', N'Menggunakan pasta pistachio 100% murni asal Sisilia tanpa pewarna buatan berwarna hijau alami.', 98000, NULL, N'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80', 5.0, 125, 330, 20, N'Best Seller', 1, 1);
GO

-- Product: Dark Chocolate Stracciatella Gelato Pint (473ml)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Dark Chocolate Stracciatella Gelato Pint (473ml)', N'dark-chocolate-stracciatella-gelato', N'Gelato susu segar lembut dengan serpihan dark chocolate renyah yang melimpah.', N'Gelato klasik Roma dengan perpaduan dasar susu fior di latte manis dan serpihan cokelat garing.', 85000, NULL, N'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=600&q=80', 4.9, 79, 210, 30, NULL, 0, 1);
GO

-- Product: Kyoto Uji Matcha Gelato Pint (473ml)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Kyoto Uji Matcha Gelato Pint (473ml)', N'kyoto-uji-matcha-gelato-pint', N'Gelato hijau matcha pekat dengan rasa earthy manis seimbang dan aroma teh hijau segar.', N'Dibuat khusus untuk pecinta matcha dengan bubuk Uji matcha murni berwarna hijau pekat alami.', 88000, NULL, N'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80', 4.9, 86, 240, 25, N'Popular', 0, 1);
GO

-- Product: Wild Strawberry & Cream Gelato Pint (473ml)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Wild Strawberry & Cream Gelato Pint (473ml)', N'wild-strawberry-cream-gelato', N'Gelato stroberi segar dengan swirl selai stroberi alami berwarna pink cerah.', N'Dibuat dari stroberi segar asli dengan paduan krim susu lembut yang memanjakan lidah.', 85000, NULL, N'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80', 4.8, 63, 180, 25, NULL, 0, 1);
GO

-- Product: Japanese Daifuku Mochi Ice Cream (Box of 4)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Japanese Daifuku Mochi Ice Cream (Box of 4)', N'japanese-daifuku-mochi-ice-cream-box-4', N'Mochi kenyal lembut dengan isian 4 rasa es krim: Matcha, Berry, Vanilla, & Cokelat.', N'Sensasi kulit mochi kenyal elastis berpadu dengan dinginnya es krim padat di dalamnya.', 46000, NULL, N'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=600&q=80', 4.8, 73, 205, 35, N'Popular', 0, 1);
GO

-- Product: Fresh Strawberry Milk Bingsu Cup
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Fresh Strawberry Milk Bingsu Cup', N'fresh-strawberry-milk-bingsu-cup', N'Es serut susu salju Korea dengan potongan stroberi segar melimpah dan es krim vanila.', N'Es salju susu super halus disiram susu kental manis dan potongan buah stroberi segar.', 42000, NULL, N'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', 4.8, 51, 140, 25, NULL, 0, 1);
GO

-- Product: Belgian Liege Pearl Sugar Waffle (Set of 2)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Belgian Liege Pearl Sugar Waffle (Set of 2)', N'belgian-liege-sugar-waffle-set-2', N'Waffle mentega Belgia tebal dengan butiran gula mutiara yang terkaramelisasi renyah.', N'Waffle ragi tradisional Belgia dengan tekstur kenyal padat dan kristal gula karamel gurih manis.', 35000, NULL, N'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80', 4.9, 98, 290, 40, N'Best Seller', 1, 1);
GO

-- Product: Spanish Cinnamon Churros with Dark Choco Dip
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Spanish Cinnamon Churros with Dark Choco Dip', N'spanish-cinnamon-churros-choco-dip', N'Churros renyah bertabur gula kayu manis lengkap dengan saus cocolan dark chocolate hangat.', N'Churros garing di luar lembut di dalam yang disajikan dengan saus cokelat Belgia kental.', 36000, NULL, N'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?auto=format&fit=crop&w=600&q=80', 4.9, 112, 350, 45, N'Popular', 0, 1);
GO

-- Product: Fluffy Japanese Souffle Pancake (Set of 2)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Fluffy Japanese Souffle Pancake (Set of 2)', N'fluffy-japanese-souffle-pancake', N'Pancake tebal awan super lembut yang bergoyang dengan sirup maple dan butter wangi.', N'Souffle pancake ala Tokyo dengan tekstur super airy yang lumer seketika saat dinikmati.', 42000, NULL, N'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=80', 4.8, 85, 240, 30, N'Chef Choice', 0, 1);
GO

-- Product: Strawberry Glazed Artisan Donut (Box of 3)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Strawberry Glazed Artisan Donut (Box of 3)', N'strawberry-glazed-artisan-donut-box', N'Donat brioche empuk beraroma butter dengan glasir stroberi segar dan taburan krispi.', N'Donat fermentasi kentang lembut dengan glasir buah stroberi alami berwarna merah muda cerah.', 38000, NULL, N'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80', 4.8, 67, 190, 40, NULL, 0, 1);
GO

-- Product: Double Chocolate Truffle Donut (Box of 3)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Double Chocolate Truffle Donut (Box of 3)', N'double-chocolate-truffle-donut-box', N'Donat brioche isi krim cokelat melimpah dengan glasir dark chocolate dan taburan cocoa.', N'Donat lembut dengan lelehan vla cokelat di dalamnya dan lapisan glasir cokelat tebal.', 38000, NULL, N'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80', 4.9, 76, 215, 35, NULL, 0, 1);
GO

-- Product: Caramelized Brioche French Toast Bites
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Caramelized Brioche French Toast Bites', N'caramelized-brioche-french-toast-bites', N'Roti brioche panggang telur susu berkaramel gula aren dengan madu hutan dan buah berry.', N'Potongan roti brioche tebal berkaramelisasi mentega yang legit dengan aroma kayu manis.', 36000, NULL, N'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80', 4.7, 49, 130, 30, NULL, 0, 1);
GO

-- Product: Kyu Deluxe Sweet Hampers & Gift Box
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Kyu Deluxe Sweet Hampers & Gift Box', N'kyu-deluxe-sweet-hampers', N'Hardbox hampers mewah berpita satin: 1 Mini Basque Cake + 4 Pastry + 6 Macarons + Custom Card.', N'Bingkisan paling berkesan untuk kado ulang tahun, anniversary, atau perayaan spesial. Dilengkapi hardbox premium bertali pita satin mewah dan kartu ucapan kustom bertuliskan pesan Anda.', 275000, 310000, N'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80', 5.0, 58, 145, 20, N'Gift Special', 1, 1);
GO

-- Product: Pastry Lovers Breakfast Gift Box (6 Pcs)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Pastry Lovers Breakfast Gift Box (6 Pcs)', N'pastry-lovers-breakfast-gift-box', N'Box hampers elegan berisi 6 aneka Croissant, Cruffin & Pain au Chocolat pilihan.', N'Paket sarapan manis berkelas berisi aneka pastry artisan fresh baked yang dikemas dalam box estetik bertali pita.', 145000, 165000, N'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80', 4.9, 44, 110, 25, N'Gift Special', 0, 1);
GO

-- Product: Gourmet Cookie Craze Gift Tin Box
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Gourmet Cookie Craze Gift Tin Box', N'gourmet-cookie-craze-gift-tin-box', N'Kaleng vintage cantik berisi 6 soft baked gourmet cookies aneka rasa.', N'Kemasan kaleng kedap udara eksklusif berisi cookies NYC Choco, Red Velvet, Matcha White Choco, dan Triple Chocolate.', 160000, 180000, N'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=600&q=80', 4.9, 39, 95, 30, N'Gift Special', 0, 1);
GO

-- Product: Macaron Rainbow Luxury Gift Box (18 Pcs)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Macaron Rainbow Luxury Gift Box (18 Pcs)', N'macaron-rainbow-luxury-gift-box-18', N'Box macaron istimewa isi 18 pcs aneka rasa lengkap dengan pita satin hadiah.', N'Koleksi lengkap seluruh varian macaron Kyu Dessert dalam susunan warna pelangi yang memukau mata dan lidah.', 225000, 250000, N'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80', 5.0, 62, 160, 20, N'Best Seller', 1, 1);
GO

-- Product: Party Dessert Cup Bundle (Set of 4)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Party Dessert Cup Bundle (Set of 4)', N'party-dessert-cup-bundle-set-4', N'Paket 4 dessert cup: Tiramisu, Caramel Custard, Panna Cotta, & Lava Cake.', N'Paket komplit untuk kumpul keluarga atau pesta kecil. Menghadirkan 4 varian dessert cup favorit dalam satu box cantik.', 135000, 150000, N'https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=600&q=80', 4.9, 53, 135, 30, N'Popular', 0, 1);
GO

-- Product: Gelato Party Cooler Box (Set of 3 Pints)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Gelato Party Cooler Box (Set of 3 Pints)', N'gelato-party-cooler-box-3-pints', N'3 Pint gelato artisan pilihan (Pistachio, Earl Grey, Stracciatella) + Insulated Cooler Bag.', N'Paket gelato dingin lengkap dengan tas pendingin berinsulasi tebal dan dry ice gel pack agar es krim tetap beku saat dikirim.', 245000, 275000, N'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80', 5.0, 48, 120, 20, N'Gift Special', 0, 1);
GO
