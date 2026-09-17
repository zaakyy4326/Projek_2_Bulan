-- RE-SEED ALL 55 PERFECT VERIFIED AUTHENTIC CULINARY DESSERTS
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
VALUES (1, N'Kyu Signature Matcha Basque Cheesecake', N'kyu-matcha-basque-cheesecake', N'Cheesecake basque lembut dengan Uji matcha Kyoto murni dan burnt caramel crust yang harum.', N'Kombinasi sempurna antara cream cheese premium New Zealand dengan bubuk Uji Matcha autentik dari Kyoto. Memiliki tekstur tengah yang melted creamy dengan lapisan atas gosong karamel yang khas.', 165000, 185000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Matcha_cheese_cake_-_Coffee_at_33_2024-02-23.jpg/960px-Matcha_cheese_cake_-_Coffee_at_33_2024-02-23.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 142, 380, 45, N'Best Seller', 1, 1);
DECLARE @p1 INT = SCOPE_IDENTITY();
INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
(@p1, N'Ukuran', N'Slice Standar', 0, 1), (@p1, N'Ukuran', N'Whole Cake 16cm (+Rp 85.000)', 85000, 0), (@p1, N'Ukuran', N'Whole Cake 20cm (+Rp 145.000)', 145000, 0), (@p1, N'Level Gula', N'Normal Sweetness (100%)', 0, 1), (@p1, N'Level Gula', N'Less Sugar (50%)', 0, 0);
GO

-- Product: Belgian Dark Chocolate Truffle Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Belgian Dark Chocolate Truffle Cake', N'belgian-dark-chocolate-truffle-cake', N'Kue cokelat Belgia 70% intens dengan lapisan ganache silky dan taburan cacao nibs.', N'Dibuat khusus untuk para pecinta cokelat sejati. Terdiri dari sponge cokelat moist, dilapisi ganache dark chocolate Belgia pekat dengan rasa pahit manis yang mewah dan seimbang.', 175000, 195000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Chocolate_Cake_Slice_in_bin_%2832180558890%29.jpg/960px-Chocolate_Cake_Slice_in_bin_%2832180558890%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 5.0, 98, 230, 30, N'Chef Choice', 1, 1);
DECLARE @p2 INT = SCOPE_IDENTITY();
INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
(@p2, N'Ukuran', N'Slice Standar', 0, 1), (@p2, N'Ukuran', N'Whole Cake 16cm (+Rp 90.000)', 90000, 0), (@p2, N'Ukuran', N'Whole Cake 20cm (+Rp 155.000)', 155000, 0);
GO

-- Product: Japanese Strawberry Blossom Shortcake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Japanese Strawberry Blossom Shortcake', N'japanese-strawberry-blossom-shortcake', N'Sponge cake vanilla super ringan dengan chantilly cream segar dan buah stroberi impor.', N'Kue shortcake ala Jepang dengan kelembutan bolu awan yang menyatu dengan krim kocok segar dan potongan stroberi manis asam yang melimpah di setiap gigitan.', 145000, 160000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Shortcake_.jpg/960px-Shortcake_.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 89, 210, 25, N'Popular', 1, 1);
DECLARE @p3 INT = SCOPE_IDENTITY();
INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
(@p3, N'Ukuran', N'Slice Standar', 0, 1), (@p3, N'Ukuran', N'Whole Cake 16cm (+Rp 80.000)', 80000, 0);
GO

-- Product: Classic New York Baked Cheesecake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Classic New York Baked Cheesecake', N'classic-new-york-baked-cheesecake', N'Cheesecake panggang klasik yang padat dan creamy dengan selai wild berry asam manis.', N'Cheesecake gaya New York dengan dasar biskuit graham buttery dan isian krim keju panggang lembut bertekstur velvety yang kaya rasa.', 155000, 175000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/09/New_York_cheesecake_2.jpg/960px-New_York_cheesecake_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 115, 310, 35, N'Best Seller', 1, 1);
GO

-- Product: Red Velvet Romance Layer Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Red Velvet Romance Layer Cake', N'red-velvet-romance-layer-cake', N'Cake merah lembut berpadu cream cheese frosting gurih asam dan taburan red velvet crumble.', N'Kue lapis merah memukau dengan aroma buttermilk cokelat ringan dan lapisan cream cheese frosting tebal yang gurih segar.', 140000, 160000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Red_Velvet_Cake_Waldorf_Astoria.jpg/960px-Red_Velvet_Cake_Waldorf_Astoria.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 76, 190, 40, NULL, 0, 1);
GO

-- Product: Lotus Biscoff Caramel Layer Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Lotus Biscoff Caramel Layer Cake', N'lotus-biscoff-caramel-layer-cake', N'Bolu karamel rempah dengan lelehan selai dan biskuit Lotus Biscoff renyah melimpah.', N'Setiap lapisannya diolesi selai Biscoff karamel rempah autentik dan ditutup dengan taburan biskuit speculoos yang crunchy.', 150000, 170000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/Lotus_Cheesecake_-_Hundred.jpg/960px-Lotus_Cheesecake_-_Hundred.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 102, 280, 30, N'Popular', 0, 1);
GO

-- Product: French Mille-Feuille Vanilla Custard
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'French Mille-Feuille Vanilla Custard', N'french-mille-feuille-vanilla-custard', N'Puff pastry seribu lapis super renyah berhimpit krim custard vanila Bourbon lembut.', N'Kue klasik Prancis dengan tiga lapisan puff pastry karamelisasi garing diselingi diplomat vanilla cream yang manis elegan.', 48000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Mille-feuille_fran%C3%A7ais_1.jpg/960px-Mille-feuille_fran%C3%A7ais_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 64, 170, 25, N'Chef Choice', 0, 1);
GO

-- Product: Kyoto Matcha Mille Crepe Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Kyoto Matcha Mille Crepe Cake', N'kyoto-matcha-mille-crepe-cake', N'20 lapisan krep tipis lembut diselingi krim matcha Uji lumer yang harum semerbak.', N'Dibuat secara presisi lapis demi lapis krep beraroma teh hijau Kyoto murni dengan rasa manis yang pas dan lumer di mulut.', 160000, 180000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/HK_YTM_MK_%E6%97%BA%E8%A7%92_Mongkok_%E6%9C%97%E8%B1%AA%E5%9D%8A_Langham_Place_basement_mall_September_2022_Px3_45.jpg/960px-HK_YTM_MK_%E6%97%BA%E8%A7%92_Mongkok_%E6%9C%97%E8%B1%AA%E5%9D%8A_Langham_Place_basement_mall_September_2022_Px3_45.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 5.0, 88, 220, 20, N'Must Try', 1, 1);
GO

-- Product: Mango Passionfruit Tropical Mousse Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Mango Passionfruit Tropical Mousse Cake', N'mango-passionfruit-tropical-mousse-cake', N'Mousse tropis buah mangga harum & markisa segar yang ringan dengan jelly glaze berkilau.', N'Dessert menyegarkan dengan paduan rasa asam manis buah tropis alami di atas lapisan sponge cake vanila yang lembut.', 135000, 150000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/HK_SKD_TKO_%E5%B0%87%E8%BB%8D%E6%BE%B3_Tseung_Kwan_O_%E5%9D%91%E5%8F%A3_Hang_Hau_%E6%9D%B1%E6%B8%AF%E5%9F%8E_East_Point_City_mall_shop_%E8%8D%B3%E5%AD%90_BEANS_cake_restaurant_September_2022_Px3_04.jpg/960px-HK_SKD_TKO_%E5%B0%87%E8%BB%8D%E6%BE%B3_Tseung_Kwan_O_%E5%9D%91%E5%8F%A3_Hang_Hau_%E6%9D%B1%E6%B8%AF%E5%9F%8E_East_Point_City_mall_shop_%E8%8D%B3%E5%AD%90_BEANS_cake_restaurant_September_2022_Px3_04.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 52, 140, 30, NULL, 0, 1);
GO

-- Product: Apple Cinnamon Butter Crumble Pie
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (1, N'Apple Cinnamon Butter Crumble Pie', N'apple-cinnamon-butter-crumble-pie', N'Pai apel kayu manis panggang bermahkotakan butter crumble renyah gurih.', N'Pai hangat isi potongan apel Malang berpadu gula palem kayu manis harum dengan kulit pastry renyah bertabur crumble mentega.', 45000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Apple_pie_slice.jpg/960px-Apple_pie_slice.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.7, 43, 115, 35, NULL, 0, 1);
GO

-- Product: French Butter Croissant (Box of 3)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'French Butter Croissant (Box of 3)', N'french-butter-croissant-box-3', N'Croissant lumer berlapis dengan butter Prancis AOP. Garing di luar dan sarang lebah di dalam.', N'Dipanggang fresh setiap subuh menggunakan 100% Elle & Vire French Butter. Proses fermentasi lambat menghasilkan aroma mentega harum semerbak.', 48000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/168_Petit-d%C3%A9jeuner_%C3%A0_l%27H%C3%B4tel_Lomipeau_%2836686208780%29.jpg/960px-168_Petit-d%C3%A9jeuner_%C3%A0_l%27H%C3%B4tel_Lomipeau_%2836686208780%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 165, 580, 80, N'Fresh Daily', 1, 1);
GO

-- Product: Pain au Chocolat Supreme
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Pain au Chocolat Supreme', N'pain-au-chocolat-supreme', N'Pastry garing berlapis mentega dengan 2 batangan dark chocolate Belgia meleleh di dalam.', N'Roti pastry cokelat klasik khas cafe Paris dengan lelehan cokelat Belgia murni berkualitas tinggi.', 35000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Pain_au_Chocolat.jpg/960px-Pain_au_Chocolat.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 82, 270, 50, N'Popular', 1, 1);
GO

-- Product: Pistachio Cream Cruffin Supreme
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Pistachio Cream Cruffin Supreme', N'pistachio-cream-cruffin-supreme', N'Perpaduan croissant & muffin dengan isian pistachio diplomat cream melimpah.', N'Adonan pastry flaky dibentuk layaknya muffin, kemudian diisi dengan custard pistachio panggang yang gurih manis dan ditaburi cacahan kacang pistachio.', 38000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Cruffin.jpg/960px-Cruffin.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 55, 145, 40, N'New', 0, 1);
GO

-- Product: Almond Frangipane Twice-Baked Croissant
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Almond Frangipane Twice-Baked Croissant', N'almond-frangipane-croissant', N'Croissant dipanggang dua kali dengan isian krim almond frangipane dan taburan almond panggang.', N'Croissant manis berlapis krim kacang almond lembut dengan topping gula bubuk dan serpihan almond renyah.', 36000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Croissant_Almond_Pastry.jpg/960px-Croissant_Almond_Pastry.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 74, 210, 45, NULL, 0, 1);
GO

-- Product: Cinnamon Roll Supreme with Vanilla Glaze
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Cinnamon Roll Supreme with Vanilla Glaze', N'cinnamon-roll-supreme-glaze', N'Roti gulung kayu manis lembut harum mentega berbalut lelehan cream cheese vanilla glaze.', N'Kelezatan roti gulung lembut dengan paduan rempah kayu manis harum, gula aren, dan lelehan glaze keju vanila yang lumer.', 32000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Cinnamon_Roll_-_Olea_2025-07-03.jpg/960px-Cinnamon_Roll_-_Olea_2025-07-03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 92, 310, 60, N'Best Seller', 0, 1);
GO

-- Product: Kouign-Amann Caramelized Breton Pastry
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Kouign-Amann Caramelized Breton Pastry', N'kouign-amann-caramelized-pastry', N'Pastry mentega khas Brittany dengan lapisan karamel gula panggang renyah mengkilap.', N'Pastry tradisional Prancis dengan aroma mentega pekat dan kerak karamel manis yang crunchy di setiap gigitan.', 30000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Kouign_Amann_sold_in_Tokyo_bakery.jpg/960px-Kouign_Amann_sold_in_Tokyo_bakery.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 61, 180, 35, NULL, 0, 1);
GO

-- Product: Danish Strawberry Cream Cheese Pastry
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Danish Strawberry Cream Cheese Pastry', N'danish-strawberry-cream-cheese', N'Pastry buah renyah dengan vla cream cheese vanila dan potongan stroberi segar asam manis.', N'Kombinasi sempurna antara kelembutan krim keju manis dengan kesegaran buah stroberi di atas puff pastry gurih.', 34000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Breads_of_Real_P%C3%A2tisserie_2023-07-12.jpg/960px-Breads_of_Real_P%C3%A2tisserie_2023-07-12.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 48, 130, 40, NULL, 0, 1);
GO

-- Product: Pain Aux Raisins (Custard Raisin Roll)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Pain Aux Raisins (Custard Raisin Roll)', N'pain-aux-raisins-custard-roll', N'Pastry ulir lembut berisi kismis manis juicy dan vanilla pastry cream yang harum.', N'Roti spiral khas Prancis dengan olesan custard vanila legit dan taburan kismis pilihan.', 30000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Pain_aux_raisins.jpg/960px-Pain_aux_raisins.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.7, 39, 95, 30, NULL, 0, 1);
GO

-- Product: Smoked Beef & Melted Cheddar Croissant
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (2, N'Smoked Beef & Melted Cheddar Croissant', N'smoked-beef-melted-cheddar-croissant', N'Croissant gurih isi irisan smoked beef premium dan keju cheddar leleh berlimpah.', N'Pilihan savory pastry lezat yang cocok untuk sarapan hangat atau camilan bergizi.', 38000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Bacon%2C_maple_%26_avo_croissant_sandwich_-_Potatoast_2026-03-03.jpg/960px-Bacon%2C_maple_%26_avo_croissant_sandwich_-_Potatoast_2026-03-03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 87, 260, 45, N'Popular', 0, 1);
GO

-- Product: Kyu Parisian Macarons (Gift Box of 6)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Kyu Parisian Macarons (Gift Box of 6)', N'kyu-parisian-macarons-box-6', N'Macaron Prancis dalam gift box elegan dengan 6 aneka rasa ganache premium pilihan.', N'Satu box berisi 6 rasa pilihan: Salted Caramel, Earl Grey Lavender, Rose Raspberry, Pistachio Delight, Dark Truffle, dan Lemon Curd dalam packaging box hadiah cantik.', 85000, 95000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Assorted_macarons_in_a_box%2C_March_2011.jpg/960px-Assorted_macarons_in_a_box%2C_March_2011.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 5.0, 230, 690, 60, N'Best Seller', 1, 1);
DECLARE @p20 INT = SCOPE_IDENTITY();
INSERT INTO [dbo].[ShopProductVariants] ([ProductId], [VariantType], [VariantName], [ExtraPrice], [IsDefault]) VALUES
(@p20, N'Paket', N'Box of 6 Pcs', 0, 1), (@p20, N'Paket', N'Deluxe Box of 12 Pcs (+Rp 75.000)', 75000, 0);
GO

-- Product: Soft Baked NYC Dark Choco & Walnut Cookie
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Soft Baked NYC Dark Choco & Walnut Cookie', N'soft-baked-nyc-dark-choco-cookie', N'Cookie tebal gaya New York yang crunchy di tepi dan gooey meleleh di tengah.', N'Menggunakan dark chocolate chunks melimpah dan renyahnya kacang walnut panggang. Nikmati selagi hangat untuk sensasi cokelat lumer yang menggoda.', 28000, NULL, N'https://upload.wikimedia.org/wikipedia/commons/b/b4/Choco_chip_cookie.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled', 4.9, 195, 540, 70, N'Popular', 1, 1);
GO

-- Product: Red Velvet Cream Cheese Stuffed Cookie
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Red Velvet Cream Cheese Stuffed Cookie', N'red-velvet-cream-cheese-stuffed-cookie', N'Soft cookie red velvet dengan isian cream cheese manis gurih yang meleleh di tengah.', N'Adonan cookie merah beraroma vanila cokelat dengan lelehan kejunya yang lumer saat digigit.', 28000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Biskut_red_velvet_%28Red_velvet_cookie%29_20230425_083506.jpg/960px-Biskut_red_velvet_%28Red_velvet_cookie%29_20230425_083506.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 88, 240, 50, NULL, 0, 1);
GO

-- Product: Matcha White Choco Chunk Cookie
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Matcha White Choco Chunk Cookie', N'matcha-white-choco-chunk-cookie', N'Soft cookie teh hijau Uji matcha dengan bongkahan cokelat putih creamy manis.', N'Rasa earthy matcha yang autentik diimbangi dengan lelehan white chocolate Belgia yang creamy.', 28000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Cookie_butter_Green_tea_Beard_Papa%27s_store_%E3%83%93%E3%82%A2%E3%83%BC%E3%83%89%E3%83%BB%E3%83%91%E3%83%91_26_January_2025_Philippines7.jpg/960px-Cookie_butter_Green_tea_Beard_Papa%27s_store_%E3%83%93%E3%82%A2%E3%83%BC%E3%83%89%E3%83%BB%E3%83%91%E3%83%91_26_January_2025_Philippines7.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 72, 210, 45, NULL, 0, 1);
GO

-- Product: Triple Belgian Chocolate Fudgy Cookie
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Triple Belgian Chocolate Fudgy Cookie', N'triple-belgian-chocolate-fudgy-cookie', N'Cookie cokelat pekat layaknya brownie dengan paduan dark, milk, dan white chocolate.', N'Sangat fudgy dan kaya rasa cokelat, dibuat khusus untuk memuaskan hasrat manis pecinta cokelat.', 28000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/109_365_-_Double_Choc_Chip_Cookies_%286343791094%29.jpg/960px-109_365_-_Double_Choc_Chip_Cookies_%286343791094%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 105, 310, 60, N'Popular', 0, 1);
GO

-- Product: Vanilla Bean Craquelin Choux (Box of 4)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Vanilla Bean Craquelin Choux (Box of 4)', N'vanilla-bean-craquelin-choux-box', N'Kue sus renyah bermahkota krispi dengan isian krim vanilla diplomat melimpah.', N'Kulit sus garing dengan lapisan craquelin manis, diisi penuh dengan custard vanila dingin yang lumer.', 52000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Choux_%C3%A0_la_cr%C3%A8me_%2819387655069%29.jpg/960px-Choux_%C3%A0_la_cr%C3%A8me_%2819387655069%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 81, 230, 40, N'Must Try', 1, 1);
GO

-- Product: Dark Chocolate Ganache Parisian Eclair
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Dark Chocolate Ganache Parisian Eclair', N'dark-chocolate-ganache-eclair', N'Eclair panjang isi custard cokelat pekat dilapisi ganache dark chocolate berkilau.', N'Kue choux lonjong lembut berisi vla cokelat Belgia berlimpah dan dilapisi ganache mengkilap di atasnya.', 32000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Eclair_au_cafe_make_hk.jpg/960px-Eclair_au_cafe_make_hk.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 63, 175, 35, NULL, 0, 1);
GO

-- Product: Canelé de Bordeaux (Box of 3)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'Canelé de Bordeaux (Box of 3)', N'canele-de-bordeaux-box-3', N'Kue Prancis berkulit karamel garing beraroma vanila Bourbon dengan tekstur dalam custard kenyal.', N'Kue mungil tradisional Prancis yang dipanggang dalam cetakan tembaga hingga berkaramel pekat di luar namun lembut creamy di dalam.', 45000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Caneles_stemilion.jpg/960px-Caneles_stemilion.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 5.0, 71, 190, 30, N'Chef Choice', 0, 1);
GO

-- Product: French Lemon Madeleine (Box of 5)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (3, N'French Lemon Madeleine (Box of 5)', N'french-lemon-madeleine-box-5', N'Kue kerang khas Prancis yang lembut beraroma butter harum dan kesegaran lemon zest.', N'Bolu mungil bentuk kerang dengan tekstur empuk ringan dan sedikit sentuhan glasir lemon tipis.', 38000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Madeleines_de_Commercy.jpg/960px-Madeleines_de_Commercy.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 54, 150, 40, NULL, 0, 1);
GO

-- Product: Royal Italian Tiramisu Cup
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Royal Italian Tiramisu Cup', N'royal-italian-tiramisu-cup', N'Tiramisu klasik Italia dengan biskuit Savoiardi berendam espresso & keju mascarpone zabaglione.', N'Dibuat dengan keju mascarpone impor asli, espresso robusta-arabica racikan khusus, dan taburan cokelat bubuk Valrhona murni tanpa gelatin.', 42000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Tiramisu_-_Raffaele_Diomede.jpg/960px-Tiramisu_-_Raffaele_Diomede.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 5.0, 145, 420, 50, N'Chef Choice', 1, 1);
GO

-- Product: Silky Japanese Caramel Custard Pudding
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Silky Japanese Caramel Custard Pudding', N'silky-caramel-custard-pudding', N'Puding karamel sutra khas Tokyo dengan saus karamel wangi sedikit pahit yang elegan.', N'Teksturnya begitu lembut hingga meleleh di lidah, dibuat dari susu segar berkualitas tinggi, telur omega-3, dan ekstrak vanilla Bourbon murni.', 32000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Caramel_Custard_Dessert.jpg/960px-Caramel_Custard_Dessert.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 102, 340, 40, N'Best Seller', 0, 1);
GO

-- Product: Mango Sago Coconut Panna Cotta Cup
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Mango Sago Coconut Panna Cotta Cup', N'mango-sago-coconut-panna-cotta', N'Panna cotta lembut berpadu puree mangga harum dan sagu mutiara kenyal menyegarkan.', N'Dessert cup dingin berlapis panna cotta krim kelapa gurih dan buah mangga manis alami.', 36000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/Fish_mango_pudding.jpg/960px-Fish_mango_pudding.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 59, 160, 35, NULL, 0, 1);
GO

-- Product: Lotus Biscoff Cheesecake Jar
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Lotus Biscoff Cheesecake Jar', N'lotus-biscoff-cheesecake-jar', N'Cheesecake dingin praktis dalam jar kaca dengan remahan biskuit dan selai karamel Biscoff.', N'Kombinasi cream cheese dingin gurih dengan remahan renyah biskuit speculoos karamel dalam kemasan jar kaca estetik.', 38000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Cheesecake_toping_strawberry_dan_biscoff.jpg/960px-Cheesecake_toping_strawberry_dan_biscoff.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 78, 220, 35, N'Popular', 0, 1);
GO

-- Product: Belgian Warm Chocolate Lava Cake
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Belgian Warm Chocolate Lava Cake', N'belgian-warm-chocolate-lava-cake', N'Cake cokelat hangat dengan lelehan saus cokelat pekat mengalir lumer saat disendok.', N'Kue cokelat panggang dengan lelehan inti cokelat cair yang lumer. Cukup dihangatkan 15 detik di microwave.', 38000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Molten_chocolate_cake.jpg/960px-Molten_chocolate_cake.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 93, 275, 30, N'Must Try', 1, 1);
GO

-- Product: Classic Vanilla Bean Crème Brûlée
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Classic Vanilla Bean Crème Brûlée', N'classic-vanilla-bean-creme-brulee', N'Custard vanila lembut dengan lapisan gula bakar karamel yang renyah saat dipecahkan.', N'Dessert klasik Prancis dengan sensasi memecahkan kerak gula karamel garing sebelum menyendok custard lembutnya.', 35000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/2014_0531_Cr%C3%A8me_br%C3%BBl%C3%A9e_Doi_Mae_Salong_%28cropped%29.jpg/960px-2014_0531_Cr%C3%A8me_br%C3%BBl%C3%A9e_Doi_Mae_Salong_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 67, 190, 25, NULL, 0, 1);
GO

-- Product: Strawberry Peach Jelly Panna Cotta
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Strawberry Peach Jelly Panna Cotta', N'strawberry-peach-jelly-panna-cotta', N'Panna cotta vanila dua lapis dengan jelly buah persik dan stroberi manis segar.', N'Panna cotta lembut dipadukan dengan jelly buah transparan yang cantik dan menyegarkan dahaga.', 34000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Panna_Cotta_%28353420626%29.jpg/960px-Panna_Cotta_%28353420626%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.7, 41, 110, 30, NULL, 0, 1);
GO

-- Product: Dark Chocolate Silk Mousse Cup
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (4, N'Dark Chocolate Silk Mousse Cup', N'dark-chocolate-silk-mousse-cup', N'Mousse cokelat Belgia super lembut bertekstur udara dengan taburan cocoa nibs.', N'Mousse ringan dan lumer di mulut yang dibuat dari cokelat hitam 70% dan whipped cream segar.', 36000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Chocolate_mousse.jpg/960px-Chocolate_mousse.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 56, 155, 30, NULL, 0, 1);
GO

-- Product: Artisan Earl Grey Lavender Gelato Pint (473ml)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Artisan Earl Grey Lavender Gelato Pint (473ml)', N'earl-grey-lavender-gelato-pint', N'Gelato lembut beraroma teh Earl Grey bergamot dengan sentuhan bunga lavender.', N'Gelato rendah lemak khas Italia dengan tekstur super padat dan creamy. Dikirim dengan packaging insulated bag dan ice pack.', 88000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Delicious_Gelato_on_display.jpg/960px-Delicious_Gelato_on_display.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 94, 260, 25, N'Must Try', 1, 1);
GO

-- Product: Roasted Sicilian Pistachio Gelato Pint (473ml)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Roasted Sicilian Pistachio Gelato Pint (473ml)', N'roasted-sicilian-pistachio-gelato', N'Gelato pistachio panggang autentik Italia yang kaya rasa, nutty, dan creamy.', N'Menggunakan pasta pistachio 100% murni asal Sisilia tanpa pewarna buatan berwarna hijau alami.', 98000, NULL, N'https://upload.wikimedia.org/wikipedia/commons/0/0e/Pistachio_ice_cream.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled', 5.0, 125, 330, 20, N'Best Seller', 1, 1);
GO

-- Product: Dark Chocolate Stracciatella Gelato Pint (473ml)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Dark Chocolate Stracciatella Gelato Pint (473ml)', N'dark-chocolate-stracciatella-gelato', N'Gelato susu segar lembut dengan serpihan dark chocolate renyah yang melimpah.', N'Gelato klasik Roma dengan perpaduan dasar susu fior di latte manis dan serpihan cokelat garing.', 85000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Stracciatella_gelato.jpg/960px-Stracciatella_gelato.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 79, 210, 30, NULL, 0, 1);
GO

-- Product: Kyoto Uji Matcha Gelato Pint (473ml)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Kyoto Uji Matcha Gelato Pint (473ml)', N'kyoto-uji-matcha-gelato-pint', N'Gelato hijau matcha pekat dengan rasa earthy manis seimbang dan aroma teh hijau segar.', N'Dibuat khusus untuk pecinta matcha dengan bubuk Uji matcha murni berwarna hijau pekat alami.', 88000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Green_tea_ice_cream_%2824295174409%29.jpg/960px-Green_tea_ice_cream_%2824295174409%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 86, 240, 25, N'Popular', 0, 1);
GO

-- Product: Wild Strawberry & Cream Gelato Pint (473ml)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Wild Strawberry & Cream Gelato Pint (473ml)', N'wild-strawberry-cream-gelato', N'Gelato stroberi segar dengan swirl selai stroberi alami berwarna pink cerah.', N'Dibuat dari stroberi segar asli dengan paduan krim susu lembut yang memanjakan lidah.', 85000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Europa-Rosarium-Rosen-Eis-2.jpg/960px-Europa-Rosarium-Rosen-Eis-2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 63, 180, 25, NULL, 0, 1);
GO

-- Product: Japanese Daifuku Mochi Ice Cream (Box of 4)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Japanese Daifuku Mochi Ice Cream (Box of 4)', N'japanese-daifuku-mochi-ice-cream-box-4', N'Mochi kenyal lembut dengan isian 4 rasa es krim: Matcha, Berry, Vanilla, & Cokelat.', N'Sensasi kulit mochi kenyal elastis berpadu dengan dinginnya es krim padat di dalamnya.', 46000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Ice_Cream_Mochi.jpg/960px-Ice_Cream_Mochi.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 73, 205, 35, N'Popular', 0, 1);
GO

-- Product: Fresh Strawberry Milk Bingsu Cup
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (5, N'Fresh Strawberry Milk Bingsu Cup', N'fresh-strawberry-milk-bingsu-cup', N'Es serut susu salju Korea dengan potongan stroberi segar melimpah dan es krim vanila.', N'Es salju susu super halus disiram susu kental manis dan potongan buah stroberi segar.', 42000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Strawberry_bingsu_0a.jpg/960px-Strawberry_bingsu_0a.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 51, 140, 25, NULL, 0, 1);
GO

-- Product: Belgian Liege Pearl Sugar Waffle (Set of 2)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Belgian Liege Pearl Sugar Waffle (Set of 2)', N'belgian-liege-sugar-waffle-set-2', N'Waffle mentega Belgia tebal dengan butiran gula mutiara yang terkaramelisasi renyah.', N'Waffle ragi tradisional Belgia dengan tekstur kenyal padat dan kristal gula karamel gurih manis.', 35000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Waffles_with_Strawberries.jpg/960px-Waffles_with_Strawberries.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 98, 290, 40, N'Best Seller', 1, 1);
GO

-- Product: Spanish Cinnamon Churros with Dark Choco Dip
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Spanish Cinnamon Churros with Dark Choco Dip', N'spanish-cinnamon-churros-choco-dip', N'Churros renyah bertabur gula kayu manis lengkap dengan saus cocolan dark chocolate hangat.', N'Churros garing di luar lembut di dalam yang disajikan dengan saus cokelat Belgia kental.', 36000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Chocolate_con_churros_%2827343655726%29.jpg/960px-Chocolate_con_churros_%2827343655726%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 112, 350, 45, N'Popular', 0, 1);
GO

-- Product: Fluffy Japanese Souffle Pancake (Set of 2)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Fluffy Japanese Souffle Pancake (Set of 2)', N'fluffy-japanese-souffle-pancake', N'Pancake tebal awan super lembut yang bergoyang dengan sirup maple dan butter wangi.', N'Souffle pancake ala Tokyo dengan tekstur super airy yang lumer seketika saat dinikmati.', 42000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Biscoffee_Japanese_souffle_pancake_at_cafe_in_Melbourne.jpg/960px-Biscoffee_Japanese_souffle_pancake_at_cafe_in_Melbourne.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 85, 240, 30, N'Chef Choice', 0, 1);
GO

-- Product: Strawberry Glazed Artisan Donut (Box of 3)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Strawberry Glazed Artisan Donut (Box of 3)', N'strawberry-glazed-artisan-donut-box', N'Donat brioche empuk beraroma butter dengan glasir stroberi segar dan taburan krispi.', N'Donat fermentasi kentang lembut dengan glasir buah stroberi alami berwarna merah muda cerah.', 38000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Fat-Doughnut-Brooklyn-Strawberry-Frosted.jpg/960px-Fat-Doughnut-Brooklyn-Strawberry-Frosted.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.8, 67, 190, 40, NULL, 0, 1);
GO

-- Product: Double Chocolate Truffle Donut (Box of 3)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Double Chocolate Truffle Donut (Box of 3)', N'double-chocolate-truffle-donut-box', N'Donat brioche isi krim cokelat melimpah dengan glasir dark chocolate dan taburan cocoa.', N'Donat lembut dengan lelehan vla cokelat di dalamnya dan lapisan glasir cokelat tebal.', 38000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Chocolate-covered_doughnut_with_red_sprinkles.JPG/960px-Chocolate-covered_doughnut_with_red_sprinkles.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 76, 215, 35, NULL, 0, 1);
GO

-- Product: Caramelized Brioche French Toast Bites
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (6, N'Caramelized Brioche French Toast Bites', N'caramelized-brioche-french-toast-bites', N'Roti brioche panggang telur susu berkaramel gula aren dengan madu hutan dan buah berry.', N'Potongan roti brioche tebal berkaramelisasi mentega yang legit dengan aroma kayu manis.', 36000, NULL, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/French_toast%2C_maple_syrup.jpg/960px-French_toast%2C_maple_syrup.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.7, 49, 130, 30, NULL, 0, 1);
GO

-- Product: Kyu Deluxe Sweet Hampers & Gift Box
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Kyu Deluxe Sweet Hampers & Gift Box', N'kyu-deluxe-sweet-hampers', N'Hardbox hampers mewah berpita satin: 1 Mini Basque Cake + 4 Pastry + 6 Macarons + Custom Card.', N'Bingkisan paling berkesan untuk kado ulang tahun, anniversary, atau perayaan spesial. Dilengkapi hardbox premium bertali pita satin mewah dan kartu ucapan kustom bertuliskan pesan Anda.', 275000, 310000, N'https://upload.wikimedia.org/wikipedia/commons/4/4d/Rose_macarons_from_Locolat%2C_December_2009.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled', 5.0, 58, 145, 20, N'Gift Special', 1, 1);
GO

-- Product: Pastry Lovers Breakfast Gift Box (6 Pcs)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Pastry Lovers Breakfast Gift Box (6 Pcs)', N'pastry-lovers-breakfast-gift-box', N'Box hampers elegan berisi 6 aneka Croissant, Cruffin & Pain au Chocolat pilihan.', N'Paket sarapan manis berkelas berisi aneka pastry artisan fresh baked yang dikemas dalam box estetik bertali pita.', 145000, 165000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Breads_on_Oak%2C_New_Orleans_Oct_2015_-_Almond_Pastry.jpg/960px-Breads_on_Oak%2C_New_Orleans_Oct_2015_-_Almond_Pastry.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 44, 110, 25, N'Gift Special', 0, 1);
GO

-- Product: Gourmet Cookie Craze Gift Tin Box
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Gourmet Cookie Craze Gift Tin Box', N'gourmet-cookie-craze-gift-tin-box', N'Kaleng vintage cantik berisi 6 soft baked gourmet cookies aneka rasa.', N'Kemasan kaleng kedap udara eksklusif berisi cookies NYC Choco, Red Velvet, Matcha White Choco, dan Triple Chocolate.', 160000, 180000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Cowboy_Cookies.jpg/960px-Cowboy_Cookies.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 39, 95, 30, N'Gift Special', 0, 1);
GO

-- Product: Macaron Rainbow Luxury Gift Box (18 Pcs)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Macaron Rainbow Luxury Gift Box (18 Pcs)', N'macaron-rainbow-luxury-gift-box-18', N'Box macaron istimewa isi 18 pcs aneka rasa lengkap dengan pita satin hadiah.', N'Koleksi lengkap seluruh varian macaron Kyu Dessert dalam susunan warna pelangi yang memukau mata dan lidah.', 225000, 250000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Arc-en-ciel_comestible.jpg/960px-Arc-en-ciel_comestible.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 5.0, 62, 160, 20, N'Best Seller', 1, 1);
GO

-- Product: Party Dessert Cup Bundle (Set of 4)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Party Dessert Cup Bundle (Set of 4)', N'party-dessert-cup-bundle-set-4', N'Paket 4 dessert cup: Tiramisu, Caramel Custard, Panna Cotta, & Lava Cake.', N'Paket komplit untuk kumpul keluarga atau pesta kecil. Menghadirkan 4 varian dessert cup favorit dalam satu box cantik.', 135000, 150000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Cr%C3%A8me_au_caramel_2.jpg/960px-Cr%C3%A8me_au_caramel_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 4.9, 53, 135, 30, N'Popular', 0, 1);
GO

-- Product: Gelato Party Cooler Box (Set of 3 Pints)
INSERT INTO [dbo].[ShopProducts] ([CategoryId], [Name], [Slug], [ShortDescription], [FullDescription], [Price], [OriginalPrice], [ImageUrl], [Rating], [TotalReviews], [TotalSold], [Stock], [BadgeText], [IsFeatured], [IsActive])
VALUES (7, N'Gelato Party Cooler Box (Set of 3 Pints)', N'gelato-party-cooler-box-3-pints', N'3 Pint gelato artisan pilihan (Pistachio, Earl Grey, Stracciatella) + Insulated Cooler Bag.', N'Paket gelato dingin lengkap dengan tas pendingin berinsulasi tebal dan dry ice gel pack agar es krim tetap beku saat dikirim.', 245000, 275000, N'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Citt%C3%A0_di_Rodi_05.JPG/960px-Citt%C3%A0_di_Rodi_05.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 5.0, 48, 120, 20, N'Gift Special', 0, 1);
GO
