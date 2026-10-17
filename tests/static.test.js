/**
 * GoalGear - Static Asset Serving Test Suite
 */

const request = require('supertest');
const app = require('../src/app');

describe('Static Asset Serving', () => {
    it('should serve index.html with 200 OK and GoalGear title', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toContain('GoalGear');
        expect(res.text).toContain('Product Catalogue');
    });

    it('should serve admin.html with 200 OK', async () => {
        const res = await request(app).get('/admin.html');
        expect(res.status).toBe(200);
        expect(res.text).toContain('GoalGear Admin');
        expect(res.text).toContain('Inventory');
    });

    it('should serve styles.css with 200 OK and correct content-type', async () => {
        const res = await request(app).get('/css/styles.css');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('css');
    });

    it('should serve js/app.js with 200 OK', async () => {
        const res = await request(app).get('/js/app.js');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('javascript');
    });

    it('should serve placeholder SVG ball with 200 OK', async () => {
        const res = await request(app).get('/images/products/placeholder-ball.svg');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('svg');
    });
});
