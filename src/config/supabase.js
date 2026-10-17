/**
 * GoalGear - Supabase Database Client & Data Layer
 *
 * Connects to Supabase PostgreSQL using server-side credentials.
 * If credentials are not yet configured in .env (e.g., initial setup or offline tests),
 * it seamlessly provides an in-memory fallback store initialized with our seed data
 * (Footballs, Boots & Shoes, Socks & Grip Socks) so all routes and automated tests work reliably.
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const isConfigured = Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseUrl.startsWith('http')
);

let supabaseClient = null;

if (isConfigured) {
    try {
        supabaseClient = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
        console.log('[GoalGear DB] Connected to Supabase Cloud Database.');
    } catch (err) {
        console.warn('[GoalGear DB] Could not initialize Supabase client:', err.message);
    }
}

// ====================================================================
// In-Memory Fallback Store (for offline testing & demo without credentials)
// ====================================================================
const inMemoryStore = {
    users: [
        {
            id: 'u-1001-demo-admin',
            email: 'admin@goalgear.demo',
            password_hash: bcrypt.hashSync('GoalGearAdmin2026!', 10),
            full_name: 'GoalGear Administrator',
            role: 'admin',
            created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
            updated_at: new Date('2026-01-01T00:00:00Z').toISOString()
        },
        {
            id: 'u-1002-demo-cust',
            email: 'customer@goalgear.demo',
            password_hash: bcrypt.hashSync('customer123', 10),
            full_name: 'Alex Striker',
            role: 'customer',
            created_at: new Date('2026-01-02T00:00:00Z').toISOString(),
            updated_at: new Date('2026-01-02T00:00:00Z').toISOString()
        }
    ],
    products: [
        // Footballs
        {
            id: 'p-2001',
            name: 'Adidas UCL Pro London Match Ball',
            brand: 'Adidas',
            department: 'Balls',
            category: 'Match Ball',
            ball_size: 5,
            size_label: 'Size 5',
            surface: 'Grass',
            fifa_rating: 'FIFA Quality Pro',
            price: 149.99,
            stock_quantity: 25,
            description: 'Official match ball of the UEFA Champions League knockout rounds. Thermally bonded seamless surface delivers true trajectory, predictable flight, and minimal moisture absorption.',
            image_url: 'images/products/adidas-ucl-pro.png',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2002',
            name: 'Nike Flight Official Match Ball',
            brand: 'Nike',
            department: 'Balls',
            category: 'Match Ball',
            ball_size: 5,
            size_label: 'Size 5',
            surface: 'Grass',
            fifa_rating: 'FIFA Quality Pro',
            price: 159.99,
            stock_quantity: 18,
            description: 'Honed over 8 years and 1,700 hours of testing, Nike Flight revolutionizes consistent ball flight with Aerowsculpt molded grooves.',
            image_url: 'images/products/nike-flight-match.png',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2003',
            name: 'Puma Orbita Serie A FIFA Quality Pro',
            brand: 'Puma',
            department: 'Balls',
            category: 'Match Ball',
            ball_size: 5,
            size_label: 'Size 5',
            surface: 'Grass',
            fifa_rating: 'FIFA Quality Pro',
            price: 139.99,
            stock_quantity: 15,
            description: 'Official match ball of Serie A. Features a 12-panel star configuration with high-frequency molded construction for exceptional touch and shape retention.',
            image_url: 'images/products/puma-orbita-pro.png',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2004',
            name: 'Select Numero 10 V23 All-Weather',
            brand: 'Select',
            department: 'Balls',
            category: 'Training Ball',
            ball_size: 5,
            size_label: 'Size 5',
            surface: 'All Weather',
            fifa_rating: 'IMS Approved',
            price: 49.99,
            stock_quantity: 40,
            description: 'The legendary training and match ball used by colleges and clubs worldwide. Hand-sewn 32-panel design with textured PU synthetic leather.',
            image_url: 'images/products/select-numero-10.png',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2005',
            name: 'Select Futsal Super FIFA Pro',
            brand: 'Select',
            department: 'Balls',
            category: 'Futsal Ball',
            ball_size: 4,
            size_label: 'Size 4',
            surface: 'Indoor Court',
            fifa_rating: 'FIFA Quality Pro',
            price: 64.99,
            stock_quantity: 22,
            description: 'Top-grade official match futsal ball with a specialized low-rebound butyl bladder for optimum control and precision handling on indoor courts.',
            image_url: 'images/products/select-futsal-super.png',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2006',
            name: 'Adidas Tango 1982 Rosario Heritage Ball',
            brand: 'Adidas',
            department: 'Balls',
            category: 'Retro/Heritage',
            ball_size: 5,
            size_label: 'Size 5',
            surface: 'Grass',
            fifa_rating: 'IMS Approved',
            price: 59.99,
            stock_quantity: 12,
            description: 'Iconic tribute to the classic 1982 World Cup Tango design. Hand-stitched polyurethane leather with latex bladder for a quintessential vintage football feel.',
            image_url: 'images/products/adidas-tango-rosario.png',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        // Boots & Shoes
        {
            id: 'p-3001',
            name: 'Nike Mercurial Vapor 15 Elite FG',
            brand: 'Nike',
            department: 'Boots',
            category: 'Football Boots',
            ball_size: null,
            size_label: 'UK 9.0',
            surface: 'Grass',
            fifa_rating: 'Elite Pro',
            price: 244.99,
            stock_quantity: 16,
            description: 'Equipped with football-specific 3/4 Zoom Air unit and grippy Vaporposite+ upper for explosive speed and razor-sharp cuts on firm grass pitches.',
            image_url: 'images/products/nike-mercurial-vapor.png',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-3002',
            name: 'Adidas Predator Elite Foldover Tongue FG',
            brand: 'Adidas',
            department: 'Boots',
            category: 'Football Boots',
            ball_size: null,
            size_label: 'UK 8.5',
            surface: 'Grass',
            fifa_rating: 'Elite Pro',
            price: 259.99,
            stock_quantity: 14,
            description: 'Iconic foldover tongue with elastic strap and precision Strikeskin rubber fins engineered for pin-point curve and clinical finishing power.',
            image_url: 'images/products/adidas-predator-elite.png',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-3003',
            name: 'Puma Future 7 Ultimate FG/AG',
            brand: 'Puma',
            department: 'Boots',
            category: 'Football Boots',
            ball_size: null,
            size_label: 'UK 9.5',
            surface: 'Grass',
            fifa_rating: 'Elite Pro',
            price: 219.99,
            stock_quantity: 12,
            description: 'FUZIONFIT360 dual mesh upper with PWRTAPE support locks the foot in place for game-changing agility and creative playmakers on both grass and turf.',
            image_url: 'images/products/puma-future-7.png',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-3004',
            name: 'Adidas Samba Classic Leather Indoor Shoes',
            brand: 'Adidas',
            department: 'Boots',
            category: 'Turf / Futsal Shoes',
            ball_size: null,
            size_label: 'UK 9.0',
            surface: 'Indoor Court',
            fifa_rating: 'Classic Club',
            price: 74.99,
            stock_quantity: 30,
            description: 'The timeless low-profile indoor football legend. Full-grain leather upper with suede toe overlay and non-marking gum rubber cupsole for maximum traction.',
            image_url: 'images/products/adidas-samba-classic.png',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        // Socks & Grip Socks
        {
            id: 'p-4001',
            name: 'GoalGear Anti-Slip Pro Grip Socks',
            brand: 'GoalGear',
            department: 'Socks',
            category: 'Grip Socks',
            ball_size: null,
            size_label: 'M (UK 6-9)',
            surface: 'All Weather',
            fifa_rating: 'Pro Grade',
            price: 14.99,
            stock_quantity: 60,
            description: 'Engineered with silicone suction grip technology on the sole and heel. Eliminates foot slippage inside boots, preventing blisters and maximizing speed transfer.',
            image_url: 'images/products/goalgear-grip-socks.png',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-4002',
            name: 'Nike Squad Crew Over-Calf Football Socks',
            brand: 'Nike',
            department: 'Socks',
            category: 'Crew Socks',
            ball_size: null,
            size_label: 'L (UK 8-11)',
            surface: 'All Weather',
            fifa_rating: 'Standard',
            price: 12.99,
            stock_quantity: 45,
            description: 'Sweat-wicking Dri-FIT fabric with targeted zonal cushioning underfoot for shock absorption and snug arch band support throughout 90 minutes.',
            image_url: 'images/products/nike-squad-socks.png',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-4003',
            name: 'Adidas Milano 23 High Match Socks',
            brand: 'Adidas',
            department: 'Socks',
            category: 'Crew Socks',
            ball_size: null,
            size_label: 'M (UK 6.5-8)',
            surface: 'All Weather',
            fifa_rating: 'Standard',
            price: 9.99,
            stock_quantity: 50,
            description: 'Classic knee-high team match socks featuring ribbed cuffs, ankle compression support, and breathable AEROREADY moisture management.',
            image_url: 'images/products/adidas-milano-socks.png',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-4004',
            name: 'Gain The Edge HexaGrip Performance Socks',
            brand: 'Gain The Edge',
            department: 'Socks',
            category: 'Grip Socks',
            ball_size: null,
            size_label: 'One Size',
            surface: 'All Weather',
            fifa_rating: 'Pro Grade',
            price: 16.99,
            stock_quantity: 35,
            description: 'Hexagonal traction pads across the ball and heel of the foot ensure zero energy loss when changing directions at top match intensity.',
            image_url: 'images/products/gte-hexagrip-socks.png',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ],
    orders: [
        {
            id: 'o-3001',
            order_number: 'GG-202610-0001',
            user_id: 'u-1002-demo-cust',
            customer_name: 'Alex Striker',
            customer_email: 'customer@goalgear.demo',
            shipping_address: '10 Wembley Way',
            city: 'London',
            postal_code: 'HA9 0WS',
            country: 'United Kingdom',
            payment_method: 'Demo Payment',
            total_amount: 149.99,
            status: 'delivered',
            notes: 'Demo delivered order',
            created_at: new Date('2026-10-10T12:00:00Z').toISOString(),
            updated_at: new Date('2026-10-12T14:00:00Z').toISOString()
        }
    ],
    order_items: [
        {
            id: 'oi-4001',
            order_id: 'o-3001',
            product_id: 'p-2001',
            product_name: 'Adidas UCL Pro London Match Ball',
            product_brand: 'Adidas',
            product_department: 'Balls',
            size_label: 'Size 5',
            quantity: 1,
            unit_price: 149.99,
            subtotal: 149.99,
            created_at: new Date('2026-10-10T12:00:00Z').toISOString()
        }
    ]
};

// Create an emulation query builder matching Supabase syntax
function createMockClient() {
    return {
        from: (table) => {
            const collection = inMemoryStore[table] || [];
            let filters = [];
            let orders = [];
            let limitCount = null;

            const builder = {
                select: (columns = '*') => builder,
                eq: (col, val) => {
                    filters.push((row) => row[col] === val);
                    return builder;
                },
                neq: (col, val) => {
                    filters.push((row) => row[col] !== val);
                    return builder;
                },
                ilike: (col, val) => {
                    const cleanVal = val.replace(/%/g, '').toLowerCase();
                    filters.push((row) => String(row[col] || '').toLowerCase().includes(cleanVal));
                    return builder;
                },
                gte: (col, val) => {
                    filters.push((row) => Number(row[col]) >= Number(val));
                    return builder;
                },
                lte: (col, val) => {
                    filters.push((row) => Number(row[col]) <= Number(val));
                    return builder;
                },
                in: (col, arr) => {
                    filters.push((row) => arr.includes(row[col]));
                    return builder;
                },
                order: (col, { ascending = true } = {}) => {
                    orders.push({ col, ascending });
                    return builder;
                },
                limit: (count) => {
                    limitCount = count;
                    return builder;
                },
                single: async () => {
                    const res = await builder;
                    if (res.error) return res;
                    return { data: res.data[0] || null, error: res.data[0] ? null : { message: 'Row not found' } };
                },
                then: (resolve) => {
                    let results = collection.filter((row) => filters.every((fn) => fn(row)));
                    for (const ord of orders) {
                        results.sort((a, b) => {
                            if (a[ord.col] < b[ord.col]) return ord.ascending ? -1 : 1;
                            if (a[ord.col] > b[ord.col]) return ord.ascending ? 1 : -1;
                            return 0;
                        });
                    }
                    if (limitCount !== null) {
                        results = results.slice(0, limitCount);
                    }
                    resolve({ data: JSON.parse(JSON.stringify(results)), error: null });
                },
                insert: (rows) => {
                    const itemsToInsert = Array.isArray(rows) ? rows : [rows];
                    const inserted = itemsToInsert.map((item) => {
                        const newRow = {
                            id: item.id || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                            ...item,
                            created_at: item.created_at || new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        };
                        collection.push(newRow);
                        return newRow;
                    });
                    return {
                        select: () => ({
                            single: async () => ({ data: JSON.parse(JSON.stringify(inserted[0])), error: null }),
                            then: (resolve) => resolve({ data: JSON.parse(JSON.stringify(inserted)), error: null })
                        }),
                        then: (resolve) => resolve({ data: JSON.parse(JSON.stringify(inserted)), error: null })
                    };
                },
                update: (updates) => {
                    return {
                        eq: (col, val) => ({
                            select: () => ({
                                single: async () => {
                                    const index = collection.findIndex((row) => row[col] === val);
                                    if (index === -1) return { data: null, error: { message: 'Not found' } };
                                    collection[index] = { ...collection[index], ...updates, updated_at: new Date().toISOString() };
                                    return { data: JSON.parse(JSON.stringify(collection[index])), error: null };
                                },
                                then: (resolve) => {
                                    const updated = [];
                                    collection.forEach((row, i) => {
                                        if (row[col] === val) {
                                            collection[i] = { ...row, ...updates, updated_at: new Date().toISOString() };
                                            updated.push(collection[i]);
                                        }
                                    });
                                    resolve({ data: JSON.parse(JSON.stringify(updated)), error: null });
                                }
                            }),
                            then: (resolve) => {
                                const updated = [];
                                collection.forEach((row, i) => {
                                    if (row[col] === val) {
                                        collection[i] = { ...row, ...updates, updated_at: new Date().toISOString() };
                                        updated.push(collection[i]);
                                    }
                                });
                                resolve({ data: JSON.parse(JSON.stringify(updated)), error: null });
                            }
                        })
                    };
                },
                delete: () => {
                    return {
                        eq: (col, val) => ({
                            then: (resolve) => {
                                for (let i = collection.length - 1; i >= 0; i--) {
                                    if (collection[i][col] === val) {
                                        collection.splice(i, 1);
                                    }
                                }
                                resolve({ data: null, error: null });
                            }
                        })
                    };
                }
            };
            return builder;
        }
    };
}

const mockClient = createMockClient();

module.exports = {
    getDb: () => supabaseClient || mockClient,
    isUsingMock: () => !supabaseClient,
    inMemoryStore
};
