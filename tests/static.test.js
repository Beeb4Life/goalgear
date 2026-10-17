/**
 * GoalGear - Static Page & Asset Serving Test Suite
 */

const request = require('supertest');
const app = require('../src/app');

describe('Static Asset & Multi-Page Serving', () => {
    it('should serve index.html with 200 OK and Home title', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toContain('GoalGear');
        expect(res.text).toContain('Featured Picks');
    });

    it('should serve catalogue.html with 200 OK and product grid', async () => {
        const res = await request(app).get('/catalogue.html');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Product Catalogue');
        expect(res.text).toContain('catalogueGrid');
    });

    it('should serve about.html with 200 OK and GoalGear heritage', async () => {
        const res = await request(app).get('/about.html');
        expect(res.status).toBe(200);
        expect(res.text).toContain('About GoalGear');
        expect(res.text).toContain('Match &amp; Training Balls');
        expect(res.text).toContain('Football Boots &amp; Cleats');
        expect(res.text).toContain('Anti-Slip Grip Socks');
    });

    it('should serve contact.html with 200 OK and store hours', async () => {
        const res = await request(app).get('/contact.html');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Contact &amp; Demo Centre');
        expect(res.text).toContain('London Headquarters');
    });

    it('should serve admin.html with 200 OK', async () => {
        const res = await request(app).get('/admin.html');
        expect(res.status).toBe(200);
        expect(res.text).toContain('GoalGear Admin');
        expect(res.text).toContain('Inventory');
    });

    it('should serve styles.css with 200 OK', async () => {
        const res = await request(app).get('/css/styles.css');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('css');
    });

    it('should serve js/app.js with 200 OK', async () => {
        const res = await request(app).get('/js/app.js');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('javascript');
    });

    it('should serve placeholder SVG ball, boots, and socks with 200 OK', async () => {
        const ballRes = await request(app).get('/images/products/placeholder-ball.svg');
        expect(ballRes.status).toBe(200);

        const bootsRes = await request(app).get('/images/products/placeholder-boots.svg');
        expect(bootsRes.status).toBe(200);

        const socksRes = await request(app).get('/images/products/placeholder-socks.svg');
        expect(socksRes.status).toBe(200);
    });
});
