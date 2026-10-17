-- ====================================================================
-- GoalGear - Sample Product Seed Data (Footballs / Soccer Balls Only)
-- ====================================================================

-- Clear existing sample products if re-seeding
-- TRUNCATE TABLE order_items, orders, products RESTART IDENTITY CASCADE;

INSERT INTO products (
    name,
    brand,
    category,
    ball_size,
    surface,
    fifa_rating,
    price,
    stock_quantity,
    description,
    image_url,
    is_featured
) VALUES
(
    'Adidas UCL Pro London Match Ball',
    'Adidas',
    'Match Ball',
    5,
    'Grass',
    'FIFA Quality Pro',
    149.99,
    25,
    'The official match ball of the UEFA Champions League knockout stages. Thermally bonded seamless surface provides a predictable trajectory, better touch, and minimal water uptake.',
    'images/products/adidas-ucl-pro.jpg',
    TRUE
),
(
    'Nike Flight Official Match Ball',
    'Nike',
    'Match Ball',
    5,
    'Grass',
    'FIFA Quality Pro',
    159.99,
    18,
    'Honed over 8 years and 1,700 hours of testing, Nike Flight revolutionizes consistent ball flight. Molded grooves (Aerowsculpt) disrupt airflow across the ball for 30% truer flight.',
    'images/products/nike-flight-match.jpg',
    TRUE
),
(
    'Puma Orbita Serie A FIFA Quality Pro',
    'Puma',
    'Match Ball',
    5,
    'Grass',
    'FIFA Quality Pro',
    139.99,
    15,
    'Official match ball of top European leagues. Features a 12-panel star configuration with high-frequency molded construction for superior shape retention and soft feel.',
    'images/products/puma-orbita-pro.jpg',
    TRUE
),
(
    'Select Numero 10 V23 All-Weather',
    'Select',
    'Training Ball',
    5,
    'All Weather',
    'IMS Approved',
    49.99,
    40,
    'The legendary training and match ball used by colleges and clubs worldwide. Hand-sewn 32-panel design with textured PU synthetic leather and zero-wing latex bladder.',
    'images/products/select-numero-10.jpg',
    TRUE
),
(
    'Adidas Tiro League Training Ball',
    'Adidas',
    'Training Ball',
    5,
    'Artificial Turf',
    'IMS Approved',
    34.99,
    55,
    'Durable, seamless training football engineered for rigorous team training on both grass and artificial turf. Low water absorption and soft polyurethane outer cover.',
    'images/products/adidas-tiro-training.jpg',
    FALSE
),
(
    'Nike Club Elite Team Football',
    'Nike',
    'Training Ball',
    4,
    'All Weather',
    'FIFA Quality',
    54.99,
    30,
    'Engineered for junior and youth academy development. Size 4 with textured casing and Nike Aerowsculpt grooves for consistent spin and touch.',
    'images/products/nike-club-elite-sz4.jpg',
    FALSE
),
(
    'Select Futsal Super FIFA Pro',
    'Select',
    'Futsal Ball',
    4,
    'Indoor Court',
    'FIFA Quality Pro',
    64.99,
    22,
    'Top-grade official match futsal ball with a specialized reduced-rebound butyl bladder for optimum control and precision handling on hardwood and indoor sports surfaces.',
    'images/products/select-futsal-super.jpg',
    TRUE
),
(
    'Puma Attacanto Futsal Trainer',
    'Puma',
    'Futsal Ball',
    4,
    'Indoor Court',
    'Standard',
    29.99,
    35,
    'Value-driven low-bounce futsal football built for intense 5-a-side practice sessions, court pickup matches, and fast-paced indoor footwork drills.',
    'images/products/puma-attacanto-futsal.jpg',
    FALSE
),
(
    'Adidas Tango 1982 Rosario Heritage Ball',
    'Adidas',
    'Retro/Heritage',
    5,
    'Grass',
    'IMS Approved',
    59.99,
    12,
    'Iconic tribute to the classic 1982 World Cup Tango design. Hand-stitched polyurethane leather with latex bladder for the quintessential vintage football aesthetic and feel.',
    'images/products/adidas-tango-rosario.jpg',
    TRUE
),
(
    'Mitre Ultimax Heritage 1995 Ball',
    'Mitre',
    'Retro/Heritage',
    5,
    'Grass',
    'Standard',
    69.99,
    10,
    'Collector edition recreation of the legendary 90s Premier League match ball. Handcrafted with classic chevron paneling and 4-ply microfibre construction.',
    'images/products/mitre-ultimax-heritage.jpg',
    FALSE
),
(
    'Nike Skills Mini Football Size 1',
    'Nike',
    'Mini Ball',
    1,
    'All Weather',
    'Standard',
    14.99,
    50,
    'Size 1 mini skills ball ideal for footwork agility, ball control training, freestyle practice, or display for football enthusiasts of all ages.',
    'images/products/nike-skills-mini-sz1.jpg',
    FALSE
),
(
    'Adidas Starlancer Youth Football Size 3',
    'Adidas',
    'Training Ball',
    3,
    'Grass',
    'Standard',
    22.99,
    45,
    'Designed specifically for junior players under 8 years old. Machine-stitched TPU cover with soft foam backing for safe, comfortable heading and kicking.',
    'images/products/adidas-starlancer-sz3.jpg',
    FALSE
);

-- ====================================================================
-- Initial Customer Demo Account (Optional for testing)
-- Password is: "customer123"
-- Bcrypt hash generated with 10 salt rounds
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
