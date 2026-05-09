-- HYPE VAULT MySQL Schema
-- Scalable ecommerce schema for premium sneaker resale marketplace
-- Includes users, sneakers, sneaker_sizes, carts, orders, order_items, inventory, wishlist, price_history

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS sneaker_sizes;
DROP TABLE IF EXISTS sneakers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(24) DEFAULT NULL,
  role ENUM('collector','admin','seller') NOT NULL DEFAULT 'collector',
  profile_handle VARCHAR(80) NOT NULL,
  loyalty_tier ENUM('bronze','silver','gold','black') NOT NULL DEFAULT 'bronze',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login DATETIME DEFAULT NULL,
  status ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',
  PRIMARY KEY (id),
  UNIQUE KEY ux_users_email (email),
  UNIQUE KEY ux_users_handle (profile_handle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sneakers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sku VARCHAR(40) NOT NULL,
  name VARCHAR(160) NOT NULL,
  brand VARCHAR(80) NOT NULL,
  model VARCHAR(120) NOT NULL,
  colorway VARCHAR(120) NOT NULL,
  release_year YEAR NOT NULL,
  rarity VARCHAR(80) NOT NULL,
  category ENUM('running','basketball','lifestyle','luxury','skate','retro','high-fashion') NOT NULL DEFAULT 'lifestyle',
  condition ENUM('deadstock','brand_new','near_mint','used') NOT NULL DEFAULT 'deadstock',
  msrp_inr INT UNSIGNED DEFAULT NULL,
  current_price_inr INT UNSIGNED NOT NULL,
  market_value_inr INT UNSIGNED DEFAULT NULL,
  description TEXT,
  image_path VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_sneakers_sku (sku),
  INDEX idx_sneakers_brand (brand),
  INDEX idx_sneakers_release_year (release_year),
  INDEX idx_sneakers_rarity (rarity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sneaker_sizes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sneaker_id BIGINT UNSIGNED NOT NULL,
  size_label VARCHAR(24) NOT NULL,
  us_size DECIMAL(4,1) NOT NULL,
  uk_size DECIMAL(4,1) DEFAULT NULL,
  eu_size DECIMAL(4,1) DEFAULT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  price_adjustment INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_sneaker_sizes_sneaker_size (sneaker_id, size_label),
  FOREIGN KEY (sneaker_id) REFERENCES sneakers(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sneaker_id BIGINT UNSIGNED NOT NULL,
  size_id BIGINT UNSIGNED NOT NULL,
  warehouse_location VARCHAR(120) NOT NULL DEFAULT 'Mumbai Vault',
  stock_quantity SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  lot_status ENUM('available','reserved','sold','inspection') NOT NULL DEFAULT 'available',
  condition_notes VARCHAR(255) DEFAULT NULL,
  last_audit_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_inventory_sneaker_size_location (sneaker_id, size_id, warehouse_location),
  FOREIGN KEY (sneaker_id) REFERENCES sneakers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (size_id) REFERENCES sneaker_sizes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_inventory_warehouse (warehouse_location),
  INDEX idx_inventory_status (lot_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE carts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  session_token VARCHAR(128) DEFAULT NULL,
  status ENUM('active','abandoned','converted') NOT NULL DEFAULT 'active',
  reserved_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_carts_session_token (session_token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_carts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id BIGINT UNSIGNED NOT NULL,
  sneaker_id BIGINT UNSIGNED NOT NULL,
  size_id BIGINT UNSIGNED NOT NULL,
  quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  price_inr INT UNSIGNED NOT NULL,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_cart_items_cart_sneaker_size (cart_id, sneaker_id, size_id),
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (sneaker_id) REFERENCES sneakers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (size_id) REFERENCES sneaker_sizes(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  cart_id BIGINT UNSIGNED DEFAULT NULL,
  order_number VARCHAR(40) NOT NULL,
  status ENUM('pending','confirmed','processing','shipped','delivered','cancelled','returned') NOT NULL DEFAULT 'pending',
  payment_method ENUM('card','upi','netbanking','wallet','cash_on_delivery') NOT NULL DEFAULT 'card',
  payment_status ENUM('pending','authorized','captured','failed','refunded') NOT NULL DEFAULT 'authorized',
  order_total_inr INT UNSIGNED NOT NULL,
  shipping_fee_inr INT UNSIGNED NOT NULL DEFAULT 0,
  handling_fee_inr INT UNSIGNED NOT NULL DEFAULT 0,
  tax_inr INT UNSIGNED NOT NULL DEFAULT 0,
  shipping_address TEXT NOT NULL,
  placed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  shipped_at DATETIME DEFAULT NULL,
  delivered_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_orders_number (order_number),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_orders_status (status),
  INDEX idx_orders_placed_at (placed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  sneaker_id BIGINT UNSIGNED NOT NULL,
  size_id BIGINT UNSIGNED NOT NULL,
  quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  unit_price_inr INT UNSIGNED NOT NULL,
  total_price_inr INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (sneaker_id) REFERENCES sneakers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (size_id) REFERENCES sneaker_sizes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_order_items_order (order_id),
  INDEX idx_order_items_sneaker (sneaker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wishlist (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  sneaker_id BIGINT UNSIGNED NOT NULL,
  priority TINYINT UNSIGNED NOT NULL DEFAULT 1,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_wishlist_user_sneaker (user_id, sneaker_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (sneaker_id) REFERENCES sneakers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_wishlist_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE price_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sneaker_id BIGINT UNSIGNED NOT NULL,
  recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  price_inr INT UNSIGNED NOT NULL,
  source VARCHAR(140) DEFAULT 'market_feed',
  note VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (sneaker_id) REFERENCES sneakers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_price_history_sneaker (sneaker_id),
  INDEX idx_price_history_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Sample sneaker inventory seed: 40 premium resale pairs
INSERT INTO sneakers (sku, name, brand, model, colorway, release_year, rarity, category, condition, msrp_inr, current_price_inr, market_value_inr, description)
VALUES
('HV-001','Air Jordan 1 High OG Lost & Found','Nike','Air Jordan 1 High OG','Chicago/Black','2022','Vault Rare','basketball','deadstock',22000,54999,62500,'A collector-grade Air Jordan 1 with lived-in heritage and premium resale demand.'),
('HV-002','Jordan 4 Military Black','Nike','Air Jordan 4','Military Black','2022','Most Traded','basketball','deadstock',21000,46999,49500,'High-heat Jordan 4 colorway with verified condition and Indian market momentum.'),
('HV-003','Nike Dunk Low Panda','Nike','Dunk Low','Panda','2021','Street Heat','lifestyle','deadstock',11000,18999,21000,'Monochrome Dunk classic, prized by collectors for its versatile palette.'),
('HV-004','Nike Air Yeezy 2 Solar Red','Nike','Yeezy 2','Solar Red','2012','Museum Piece','luxury','deadstock',600000,720000,780000,'Ultra-rare Kanye West Nike collaboration with legendary resale value.'),
('HV-005','Nike Air Max 1 Patta Monarch','Nike','Air Max 1','Patta Monarch','2023','Private Drop','running','deadstock',18000,32500,35500,'Coveted Air Max 1 from Patta with premium Indian collector demand.'),
('HV-006','Nike Air Fear of God 1 Triple Black','Nike','Air Fear of God 1','Triple Black','2020','Luxury Sport','luxury','deadstock',45000,69999,74500,'Minimalist GYAKUSOU-inspired Fear of God silhouette, perfect for premium sneaker wardrobes.'),
('HV-007','Jordan 3 A Ma Maniere','Nike','Air Jordan 3','A Ma Maniere','2021','Boutique Rare','basketball','deadstock',23000,52999,57000,'A premium Jordan 3 collaboration with leather upgrades and fashion authority.'),
('HV-008','Jordan 4 Retro Bred Reimagined','Nike','Air Jordan 4','Bred Reimagined','2024','Hot Ask','basketball','deadstock',19000,34999,38000,'Contemporary retro iteration of the iconic Bred 4 with high collector interest.'),
('HV-009','Nike SB Dunk Low Ben & Jerry Chunky Dunky','Nike','SB Dunk Low','Chunky Dunky','2020','Collector Grade','skate','deadstock',71000,118000,129000,'Playful Ben & Jerry inspired SB Dunk that still commands luxury resale pricing.'),
('HV-010','Yeezy Boost 350 V2 Zebra','Adidas','Yeezy Boost 350','Zebra','2017','Yeezy Icon','lifestyle','deadstock',13000,39999,43000,'One of the most iconic Yeezy colorways, still a highly desirable resale staple.'),
('HV-011','Yeezy Boost 350 V2 Onyx','Adidas','Yeezy Boost 350','Onyx','2022','Collector Grade','lifestyle','deadstock',12500,31500,34500,'Low-key black Yeezy with broad streetwear appeal and premium secondary market price.'),
('HV-012','Adidas Samba OG Cloud White','Adidas','Samba OG','Cloud White','2023','Street Heat','lifestyle','deadstock',10000,16499,18500,'Modern Samba release with premium vintage styling and strong resale performance.'),
('HV-013','Adidas Campus 00s Core Black','Adidas','Campus 00s','Core Black','2023','Street Essential','lifestyle','deadstock',9000,14999,16800,'Minimalist campus silhouette with elevated streetwear utility.'),
('HV-014','Yeezy Foam Runner Ararat','Adidas','Foam Runner','Ararat','2020','Future Classic','lifestyle','deadstock',11500,28500,31000,'Contemporary Yeezy foam design with collector demand and resale momentum.'),
('HV-015','Adidas UltraBoost 1.0 Cream','Adidas','UltraBoost 1.0','Cream','2015','Runner Icon','running','deadstock',12000,22999,25500,'Vintage UltraBoost iteration with strong heritage and resale interest.'),
('HV-016','Adidas NMD Hu Pharrell Core Black','Adidas','NMD Hu','Core Black','2020','Culture Pick','lifestyle','deadstock',17000,33999,37000,'Pharrell x NMD collaboration, rare in fresh condition for collectors.'),
('HV-017','Adidas Gazelle Indoor Blue Bird','Adidas','Gazelle','Indoor Blue Bird','2023','Rising','lifestyle','deadstock',9500,17999,20000,'Limited Gazelle drop with striking blue accent and collector attention.'),
('HV-018','Adidas Forum Low Bad Bunny Back To School','Adidas','Forum Low','Bad Bunny Back To School','2021','Artist Drop','lifestyle','deadstock',28000,42000,45500,'Star-studded collaboration with strong secondary demand in India.'),
('HV-019','Adidas Spezial Handball','Adidas','Spezial Handball','Light Blue','2024','Rising','lifestyle','deadstock',11000,15999,18200,'Premium Spezial colorway positioned for collectors of contemporary silhouettes.'),
('HV-020','Adidas Superstar Prada Re-Nylon','Adidas','Superstar','Prada Re-Nylon','2020','Luxury Collab','luxury','deadstock',52000,82000,89000,'Luxury Prada collaboration that merges heritage shelltoe style and high resale value.'),
('HV-021','Dior B22 Reflective Silver','Dior','B22','Reflective Silver','2023','Private Demand','luxury','deadstock',195000,142000,160000,'House of Dior luxury sneaker with extraordinary resale cachet.'),
('HV-022','Dior B30 Technical Mesh Silver','Dior','B30','Technical Mesh Silver','2023','Luxury Vault','luxury','deadstock',215000,128000,142000,'New Dior statement sneaker engineered for runway and premium resale.'),
('HV-023','Louis Vuitton LV Trainer Denim Monogram Eclipse','Louis Vuitton','LV Trainer','Denim Monogram Eclipse','2022','Private Stock','luxury','deadstock',230000,172000,187000,'LV trainer that blends luxury branding and sneaker lifestyle demand.'),
('HV-024','Balenciaga Track.2 Black Mesh','Balenciaga','Track.2','Black Mesh','2021','Runway Pair','luxury','deadstock',190000,96500,109000,'Balenciaga performance-inspired luxury sneaker for high-end collectors.'),
('HV-025','Prada America Cup Patent Black','Prada','America Cup','Patent Black','2020','Gallery Select','luxury','deadstock',160000,89999,98000,'Patented Prada dress sneaker with premium resale and collector appeal.'),
('HV-026','Gucci Rhyton Logo Leather Sneaker','Gucci','Rhyton','Logo Leather','2019','House Icon','luxury','deadstock',135000,74999,85000,'Gucci house sneaker with logo-heavy statement styling and resale strength.'),
('HV-027','Puma MB.01 Iridescent Black','Puma','MB.01','Iridescent Black','2022','Limited Run','lifestyle','deadstock',18000,24999,28500,'Modern basketball-inspired Puma sneaker from a premium designer capsule.'),
('HV-028','Puma Suede VTG Black Frost','Puma','Suede VTG','Black Frost','2023','Rising','lifestyle','deadstock',9500,11999,13500,'Classic Puma suede revival with collector-friendly pricing.'),
('HV-029','Puma Clyde OG Silver Foil','Puma','Clyde OG','Silver Foil','2024','Archive Pick','lifestyle','deadstock',11000,13999,15800,'Modernized silver Clyde OG that appeals to streetwear enthusiasts.'),
('HV-030','Converse Run Star Legacy CX Noir','Converse','Run Star Legacy','CX Noir','2022','Platform Heat','lifestyle','deadstock',8500,18750,20500,'High-fashion Converse platform with premium aesthetic and resale demand.'),
('HV-031','Converse Chuck 70 CDG Play Black','Converse','Chuck 70','CDG Play Black','2021','Collab Classic','lifestyle','deadstock',12000,21999,24500,'Comme des Garçons x Converse icon with enduring collector resale.'),
('HV-032','Nike Air Max 97 Silver Bullet','Nike','Air Max 97','Silver Bullet','2022','Retro Heat','running','deadstock',19000,27999,31000,'Classic Air Max 97 colorway with timeless collector relevance.'),
('HV-033','Nike Air Jordan 11 Retro Concord','Nike','Air Jordan 11','Concord','2018','Icon','basketball','deadstock',18000,38999,42000,'Jordan 11 Concord, a high-demand retro with serious market interest.'),
('HV-034','Nike Dunk Low Off-White Lot 50','Nike','Dunk Low','Off-White Lot 50','2021','Designer Vault','lifestyle','deadstock',125000,92000,98000,'Virgil Abloh collaboration with rare Nike dunk styling and elevated resale.'),
('HV-035','Nike Kobe 6 Protro Grinch','Nike','Kobe 6 Protro','Grinch','2020','Court Grail','basketball','deadstock',19000,78000,84000,'Legendary Kobe 6 colorway with aggressive collector bids and resale pricing.'),
('HV-036','Jordan 1 Retro High Travis Scott Mocha','Nike','Air Jordan 1 Retro High','Travis Scott Mocha','2019','Grail','basketball','deadstock',210000,162000,178000,'Sought-after Travis Scott Jordan 1 collaboration with resale premium.'),
('HV-037','Nike Air Max 97 Silver Bullet','Nike','Air Max 97','Silver Bullet','1997','Retro Heat','running','deadstock',22000,27999,31000,'Original Silver Bullet reissue with collector status in India.'),
('HV-038','Adidas Yeezy Boost 700 Wave Runner','Adidas','Yeezy Boost 700','Wave Runner','2017','Modern Grail','lifestyle','deadstock',17000,44999,49500,'Cult classic Wave Runner design with strong resale in the secondary market.'),
('HV-039','Off-White x Nike Air Presto','Nike','Air Presto','Off-White','2018','Designer Vault','running','deadstock',220000,185000,205000,'Iconic Virgil Abloh collaboration with very high secondary market demand.'),
('HV-040','Jordan 1 Satin Bred','Nike','Air Jordan 1 High OG','Satin Bred','2020','Luxury Collab','basketball','deadstock',19000,159999,175000,'Premium satin Jordan 1 with collector appeal and high resale pricing.');
