/**
 * GoalGear - Supabase Database Client & Data Layer
 *
 * Connects to Supabase PostgreSQL using server-side credentials.
 * If credentials are not yet configured in .env (e.g., initial setup or offline tests),
 * it seamlessly provides an in-memory fallback store initialized with our seed data
 * so all routes and automated tests work reliably.
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
        {
            id: 'p-2001',
            name: 'Adidas UCL Pro London Match Ball',
            brand: 'Adidas',
            category: 'Match Ball',
            ball_size: 5,
            surface: 'Grass',
            fifa_rating: 'FIFA Quality Pro',
            price: 149.99,
            stock_quantity: 25,
            description: 'The official match ball of the UEFA Champions League knockout stages. Thermally bonded seamless surface provides a predictable trajectory, better touch, and minimal water uptake.',
            image_url: 'images/products/adidas-ucl-pro.jpg',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2002',
            name: 'Nike Flight Official Match Ball',
            brand: 'Nike',
            category: 'Match Ball',
            ball_size: 5,
            surface: 'Grass',
            fifa_rating: 'FIFA Quality Pro',
            price: 159.99,
            stock_quantity: 18,
            description: 'Honed over 8 years and 1,700 hours of testing, Nike Flight revolutionizes consistent ball flight. Molded grooves (Aerowsculpt) disrupt airflow across the ball for 30% truer flight.',
            image_url: 'images/products/nike-flight-match.jpg',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2003',
            name: 'Puma Orbita Serie A FIFA Quality Pro',
            brand: 'Puma',
            category: 'Match Ball',
            ball_size: 5,
            surface: 'Grass',
            fifa_rating: 'FIFA Quality Pro',
            price: 139.99,
            stock_quantity: 15,
            description: 'Official match ball of top European leagues. Features a 12-panel star configuration with high-frequency molded construction for superior shape retention and soft feel.',
            image_url: 'images/products/puma-orbita-pro.jpg',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2004',
            name: 'Select Numero 10 V23 All-Weather',
            brand: 'Select',
            category: 'Training Ball',
            ball_size: 5,
            surface: 'All Weather',
            fifa_rating: 'IMS Approved',
            price: 49.99,
            stock_quantity: 40,
            description: 'The legendary training and match ball used by colleges and clubs worldwide. Hand-sewn 32-panel design with textured PU synthetic leather and zero-wing latex bladder.',
            image_url: 'images/products/select-numero-10.jpg',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2005',
            name: 'Adidas Tiro League Training Ball',
            brand: 'Adidas',
            category: 'Training Ball',
            ball_size: 5,
            surface: 'Artificial Turf',
            fifa_rating: 'IMS Approved',
            price: 34.99,
            stock_quantity: 55,
            description: 'Durable, seamless training football engineered for rigorous team training on both grass and artificial turf. Low water absorption and soft polyurethane outer cover.',
            image_url: 'images/products/adidas-tiro-training.jpg',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2006',
            name: 'Nike Club Elite Team Football',
            brand: 'Nike',
            category: 'Training Ball',
            ball_size: 4,
            surface: 'All Weather',
            fifa_rating: 'FIFA Quality',
            price: 54.99,
            stock_quantity: 30,
            description: 'Engineered for junior and youth academy development. Size 4 with textured casing and Nike Aerowsculpt grooves for consistent spin and touch.',
            image_url: 'images/products/nike-club-elite-sz4.jpg',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2007',
            name: 'Select Futsal Super FIFA Pro',
            brand: 'Select',
            category: 'Futsal Ball',
            ball_size: 4,
            surface: 'Indoor Court',
            fifa_rating: 'FIFA Quality Pro',
            price: 64.99,
            stock_quantity: 22,
            description: 'Top-grade official match futsal ball with a specialized reduced-rebound butyl bladder for optimum control and precision handling on hardwood and indoor sports surfaces.',
            image_url: 'images/products/select-futsal-super.jpg',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2008',
            name: 'Puma Attacanto Futsal Trainer',
            brand: 'Puma',
            category: 'Futsal Ball',
            ball_size: 4,
            surface: 'Indoor Court',
            fifa_rating: 'Standard',
            price: 29.99,
            stock_quantity: 35,
            description: 'Value-driven low-bounce futsal football built for intense 5-a-side practice sessions, court pickup matches, and fast-paced indoor footwork drills.',
            image_url: 'images/products/puma-attacanto-futsal.jpg',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2009',
            name: 'Adidas Tango 1982 Rosario Heritage Ball',
            brand: 'Adidas',
            category: 'Retro/Heritage',
            ball_size: 5,
            surface: 'Grass',
            fifa_rating: 'IMS Approved',
            price: 59.99,
            stock_quantity: 12,
            description: 'Iconic tribute to the classic 1982 World Cup Tango design. Hand-stitched polyurethane leather with latex bladder for the quintessential vintage football aesthetic and feel.',
            image_url: 'images/products/adidas-tango-rosario.jpg',
            is_featured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'p-2010',
            name: 'Nike Skills Mini Football Size 1',
            brand: 'Nike',
            category: 'Mini Ball',
            ball_size: 1,
            surface: 'All Weather',
            fifa_rating: 'Standard',
            price: 14.99,
            stock_quantity: 50,
            description: 'Size 1 mini skills ball ideal for footwork agility, ball control training, freestyle practice, or display for football enthusiasts of all ages.',
            image_url: 'images/products/nike-skills-mini-sz1.jpg',
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
            ball_size: 5,
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
                    // Return cloned copies to prevent accidental reference mutation
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
                                const initialLen = collection.length;
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
    inMemoryStore // Exported for testing assertions
};
