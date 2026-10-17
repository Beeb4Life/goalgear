-- ====================================================================
-- GoalGear - Seed Data (Footballs, Boots & Shoes, Socks & Grip Socks)
-- ====================================================================

INSERT INTO products (
    name,
    brand,
    department,
    category,
    ball_size,
    size_label,
    surface,
    fifa_rating,
    price,
    stock_quantity,
    description,
    image_url,
    is_featured
) VALUES
-- ====================================================================
-- FOOTBALLS
-- ====================================================================
(
    'Adidas UCL Pro London Match Ball',
    'Adidas',
    'Balls',
    'Match Ball',
    5,
    'Size 5',
    'Grass',
    'FIFA Quality Pro',
    149.99,
    25,
    'Official match ball of the UEFA Champions League knockout rounds. Thermally bonded seamless surface delivers true trajectory, predictable flight, and minimal moisture absorption.',
    'images/products/adidas-ucl-pro.png',
    TRUE
),
(
    'Nike Flight Official Match Ball',
    'Nike',
    'Balls',
    'Match Ball',
    5,
    'Size 5',
    'Grass',
    'FIFA Quality Pro',
    159.99,
    18,
    'Revolutionary Aerowsculpt molded grooves disrupt airflow across the ball for 30% truer flight and unmatched consistency under top flight competition.',
    'images/products/nike-flight-match.png',
    TRUE
),
(
    'Puma Orbita Serie A FIFA Quality Pro',
    'Puma',
    'Balls',
    'Match Ball',
    5,
    'Size 5',
    'Grass',
    'FIFA Quality Pro',
    139.99,
    15,
    'Official match ball of Serie A. Features a 12-panel star configuration with high-frequency molded construction for exceptional touch and shape retention.',
    'images/products/puma-orbita-pro.png',
    TRUE
),
(
    'Select Numero 10 V23 All-Weather',
    'Select',
    'Balls',
    'Training Ball',
    5,
    'Size 5',
    'All Weather',
    'IMS Approved',
    49.99,
    40,
    'The iconic training and match ball trusted worldwide. Hand-sewn 32-panel design with textured PU synthetic leather and zero-wing latex bladder.',
    'images/products/select-numero-10.png',
    TRUE
),
(
    'Select Futsal Super FIFA Pro',
    'Select',
    'Balls',
    'Futsal Ball',
    4,
    'Size 4',
    'Indoor Court',
    'FIFA Quality Pro',
    64.99,
    22,
    'Top-grade official match futsal ball with a specialized low-rebound butyl bladder for optimum control and precision handling on indoor court surfaces.',
    'images/products/select-futsal-super.png',
    FALSE
),
(
    'Adidas Tango 1982 Rosario Heritage Ball',
    'Adidas',
    'Balls',
    'Retro/Heritage',
    5,
    'Size 5',
    'Grass',
    'IMS Approved',
    59.99,
    12,
    'Iconic tribute to the classic 1982 World Cup Tango design. Hand-stitched polyurethane leather with latex bladder for a quintessential vintage football feel.',
    'images/products/adidas-tango-rosario.png',
    FALSE
),

-- ====================================================================
-- FOOTBALL BOOTS & SHOES
-- ====================================================================
(
    'Nike Mercurial Vapor 15 Elite FG',
    'Nike',
    'Boots',
    'Football Boots',
    NULL,
    'UK 9.0',
    'Grass',
    'Elite Pro',
    244.99,
    16,
    'Equipped with football-specific 3/4 Zoom Air unit and grippy Vaporposite+ upper for explosive speed and razor-sharp cuts on firm grass pitches.',
    'images/products/nike-mercurial-vapor.png',
    TRUE
),
(
    'Adidas Predator Elite Foldover Tongue FG',
    'Adidas',
    'Boots',
    'Football Boots',
    NULL,
    'UK 8.5',
    'Grass',
    'Elite Pro',
    259.99,
    14,
    'Iconic foldover tongue with elastic strap and precision Strikeskin rubber fins engineered for pin-point curve and clinical finishing power.',
    'images/products/adidas-predator-elite.png',
    TRUE
),
(
    'Puma Future 7 Ultimate FG/AG',
    'Puma',
    'Boots',
    'Football Boots',
    NULL,
    'UK 9.5',
    'Grass',
    'Elite Pro',
    219.99,
    12,
    'FUZIONFIT360 dual mesh upper with PWRTAPE support locks the foot in place for game-changing agility and creative playmakers on both grass and turf.',
    'images/products/puma-future-7.png',
    FALSE
),
(
    'Adidas Samba Classic Leather Indoor Shoes',
    'Adidas',
    'Boots',
    'Turf / Futsal Shoes',
    NULL,
    'UK 9.0',
    'Indoor Court',
    'Classic Club',
    74.99,
    30,
    'The timeless low-profile indoor football legend. Full-grain leather upper with suede toe overlay and non-marking gum rubber cupsole for maximum hardwood traction.',
    'images/products/adidas-samba-classic.png',
    TRUE
),

-- ====================================================================
-- SOCKS & GRIP SOCKS
-- ====================================================================
(
    'GoalGear Anti-Slip Pro Grip Socks',
    'GoalGear',
    'Socks',
    'Grip Socks',
    NULL,
    'M (UK 6-9)',
    'All Weather',
    'Pro Grade',
    14.99,
    60,
    'Engineered with silicone suction grip technology on the sole and heel. Eliminates foot slippage inside boots, preventing blisters and maximizing speed transfer during sprints.',
    'images/products/goalgear-grip-socks.png',
    TRUE
),
(
    'Nike Squad Crew Over-Calf Football Socks',
    'Nike',
    'Socks',
    'Crew Socks',
    NULL,
    'L (UK 8-11)',
    'All Weather',
    'Standard',
    12.99,
    45,
    'Sweat-wicking Dri-FIT fabric with targeted zonal cushioning underfoot for shock absorption and snug arch band support throughout 90 minutes.',
    'images/products/nike-squad-socks.png',
    FALSE
),
(
    'Adidas Milano 23 High Match Socks',
    'Adidas',
    'Socks',
    'Crew Socks',
    NULL,
    'M (UK 6.5-8)',
    'All Weather',
    'Standard',
    9.99,
    50,
    'Classic knee-high team match socks featuring ribbed cuffs, ankle compression support, and breathable AEROREADY moisture management.',
    'images/products/adidas-milano-socks.png',
    FALSE
),
(
    'Gain The Edge HexaGrip Performance Socks',
    'Gain The Edge',
    'Socks',
    'Grip Socks',
    NULL,
    'One Size (UK 6-11)',
    'All Weather',
    'Pro Grade',
    16.99,
    35,
    'Hexagonal traction pads across the ball and heel of the foot ensure zero energy loss when changing directions at top match intensity.',
    'images/products/gte-hexagrip-socks.png',
    FALSE
);

-- ====================================================================
-- Initial Customer Demo Account
-- ====================================================================
INSERT INTO users (
    email,
    password_hash,
    full_name,
    role
) VALUES (
    'customer@goalgear.demo',
    '$2a$10$wTqS8k6Z2iO6k0h3X7wMh.5x8aA9m0sL3J6.sO1s8c7eF4Z3zY3gG',
    'Alex Striker',
    'customer'
) ON CONFLICT (email) DO NOTHING;
