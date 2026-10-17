/**
 * GoalGear - Comprehensive API Test Suite
 *
 * Tests all core routes, authentication, order placement,
 * inventory updates, and role-based access control across
 * Footballs, Football Boots, and Socks.
 */

const request = require('supertest');
const app = require('../src/app');

describe('GoalGear API Test Suite', () => {
    let customerToken = '';
    let customerId = '';
    let adminToken = '';
    let testProductId = '';

    const testCustomerEmail = `tester-${Date.now()}@goalgear.test`;
    const testCustomerPassword = 'Password123!';

    beforeAll(async () => {
        // Log in demo admin
        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@goalgear.demo',
                password: 'GoalGearAdmin2026!'
            });

        expect(adminLoginRes.status).toBe(200);
        adminToken = adminLoginRes.body.token;
        expect(adminLoginRes.body.user.role).toBe('admin');
    });

    // ================================================================
    // 1. Health Check
    // ================================================================
    describe('GET /api/health', () => {
        it('should return 200 OK and status information', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.app).toContain('GoalGear');
        });
    });

    // ================================================================
    // 2. Authentication API
    // ================================================================
    describe('Authentication Endpoints', () => {
        it('should register a new customer', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: testCustomerEmail,
                    password: testCustomerPassword,
                    fullName: 'John Test Striker'
                });

            expect(res.status).toBe(201);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.email).toBe(testCustomerEmail);
            expect(res.body.user.role).toBe('customer');
            expect(res.body.token).toBeDefined();

            customerToken = res.body.token;
            customerId = res.body.user.id;
        });

        it('should prevent registration with duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: testCustomerEmail,
                    password: testCustomerPassword,
                    fullName: 'Duplicate User'
                });

            expect(res.status).toBe(409);
        });

        it('should reject login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testCustomerEmail,
                    password: 'WrongPassword123'
                });

            expect(res.status).toBe(401);
        });

        it('should login customer with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testCustomerEmail,
                    password: testCustomerPassword
                });

            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
            expect(res.body.user.email).toBe(testCustomerEmail);
        });

        it('should fetch authenticated profile with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.user.email).toBe(testCustomerEmail);
        });

        it('should reject profile request without token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });
    });

    // ================================================================
    // 3. Products Catalogue API (Balls, Boots, Socks)
    // ================================================================
    describe('Products Endpoints', () => {
        it('should list all football gear', async () => {
            const res = await request(app).get('/api/products');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.products)).toBe(true);
            expect(res.body.products.length).toBeGreaterThan(0);

            testProductId = res.body.products[0].id;
        });

        it('should filter gear by department (Boots)', async () => {
            const res = await request(app).get('/api/products?department=Boots');
            expect(res.status).toBe(200);
            expect(res.body.products.length).toBeGreaterThan(0);
            res.body.products.forEach((p) => {
                expect(p.department).toBe('Boots');
            });
        });

        it('should filter gear by department (Socks)', async () => {
            const res = await request(app).get('/api/products?department=Socks');
            expect(res.status).toBe(200);
            expect(res.body.products.length).toBeGreaterThan(0);
            res.body.products.forEach((p) => {
                expect(p.department).toBe('Socks');
            });
        });

        it('should filter gear by category', async () => {
            const res = await request(app).get('/api/products?category=Match%20Ball');
            expect(res.status).toBe(200);
            res.body.products.forEach((p) => {
                expect(p.category).toBe('Match Ball');
            });
        });

        it('should search gear by keyword', async () => {
            const res = await request(app).get('/api/products?search=Nike');
            expect(res.status).toBe(200);
            res.body.products.forEach((p) => {
                const text = `${p.name} ${p.brand} ${p.description}`.toLowerCase();
                expect(text).toContain('nike');
            });
        });

        it('should return featured gear', async () => {
            const res = await request(app).get('/api/products/featured');
            expect(res.status).toBe(200);
            expect(res.body.products.length).toBeGreaterThan(0);
            res.body.products.forEach((p) => {
                expect(p.is_featured).toBe(true);
            });
        });

        it('should fetch single product details', async () => {
            const res = await request(app).get(`/api/products/${testProductId}`);
            expect(res.status).toBe(200);
            expect(res.body.product.id).toBe(testProductId);
        });

        it('should return 404 for non-existent product', async () => {
            const res = await request(app).get('/api/products/non-existent-id-999');
            expect(res.status).toBe(404);
        });
    });

    // ================================================================
    // 4. Order Placement & Inventory
    // ================================================================
    describe('Order Placement Endpoints', () => {
        let initialStock = 0;

        beforeAll(async () => {
            const pRes = await request(app).get(`/api/products/${testProductId}`);
            initialStock = pRes.body.product.stock_quantity;
        });

        it('should place a demo order and decrement stock quantity', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    items: [{ productId: testProductId, quantity: 2 }],
                    customerName: 'John Test Striker',
                    customerEmail: testCustomerEmail,
                    shippingAddress: '42 High Street',
                    city: 'Manchester',
                    postalCode: 'M1 1AA',
                    country: 'United Kingdom',
                    paymentMethod: 'Demo Checkout'
                });

            expect(res.status).toBe(201);
            expect(res.body.order).toBeDefined();
            expect(res.body.order.order_number).toMatch(/^GG-/);
            expect(res.body.order.items.length).toBe(1);

            // Verify stock decreased by 2
            const checkProduct = await request(app).get(`/api/products/${testProductId}`);
            expect(checkProduct.body.product.stock_quantity).toBe(initialStock - 2);
        });

        it('should reject order if requested quantity exceeds stock', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({
                    items: [{ productId: testProductId, quantity: 99999 }],
                    customerName: 'John Greedy',
                    customerEmail: 'greedy@goalgear.test',
                    shippingAddress: '123 Fake Rd',
                    city: 'London',
                    postalCode: 'E1 6AN'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Insufficient stock');
        });

        it('should fetch order history for authenticated customer', async () => {
            const res = await request(app)
                .get('/api/orders/my-orders')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.orders.length).toBeGreaterThan(0);
            expect(res.body.orders[0].customer_email).toBe(testCustomerEmail);
        });
    });

    // ================================================================
    // 5. Admin Protected Routes & Role Authorization
    // ================================================================
    describe('Admin Protected Routes', () => {
        it('should block unauthenticated access to admin stats (401)', async () => {
            const res = await request(app).get('/api/admin/stats');
            expect(res.status).toBe(401);
        });

        it('should block customer from accessing admin stats (403)', async () => {
            const res = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(403);
            expect(res.body.error).toContain('Administrator privileges required');
        });

        it('should allow admin to access dashboard stats', async () => {
            const res = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.stats).toBeDefined();
            expect(typeof res.body.stats.totalRevenue).toBe('number');
            expect(typeof res.body.stats.totalProducts).toBe('number');
        });

        it('should allow admin to create football boots', async () => {
            const res = await request(app)
                .post('/api/admin/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Mizuno Morelia Neo IV Beta Made In Japan FG',
                    brand: 'Mizuno',
                    department: 'Boots',
                    category: 'Football Boots',
                    size_label: 'UK 9.0',
                    surface: 'Grass',
                    fifa_rating: 'Elite Pro',
                    price: 279.99,
                    stock_quantity: 10,
                    description: 'Handcrafted ultra-lightweight kangaroo leather boots.',
                    image_url: 'images/products/mizuno-morelia-neo.jpg',
                    is_featured: true
                });

            expect(res.status).toBe(201);
            expect(res.body.product.name).toBe('Mizuno Morelia Neo IV Beta Made In Japan FG');
            expect(res.body.product.department).toBe('Boots');
        });

        it('should allow admin to update order status', async () => {
            const ordersRes = await request(app)
                .get('/api/admin/orders')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(ordersRes.status).toBe(200);
            expect(ordersRes.body.orders.length).toBeGreaterThan(0);

            const targetOrder = ordersRes.body.orders[0];

            const updateRes = await request(app)
                .patch(`/api/admin/orders/${targetOrder.id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'shipped' });

            expect(updateRes.status).toBe(200);
            expect(updateRes.body.order.status).toBe('shipped');
        });
    });
});
