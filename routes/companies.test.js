process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testComp;
beforeEach(async () => {
    await db.query(
        `TRUNCATE companies, invoices CASCADE`
    );
    const result = await db.query(
        `INSERT INTO companies (code, name)
         VALUES ('tar', 'Target')
         RETURNING code, name`
    );
    testComp = result.rows[0];
})
afterAll(async () => {
    await db.end()
})

describe('GET /companies route', function () {
    it('Returns a list of companies', async function () {
        const resp = await request(app).get('/companies');
        expect(resp.statusCode).toBe(200);
        expect(resp.body.companies).toEqual([{ "code": "tar", "name": "Target"}])
    });
})

describe('GET /companies/:code route', function () {
    it('Returns a single company from database', async function () {
        const resp = await request(app).get(`/companies/tar`);
        expect(resp.statusCode).toBe(200);
        expect (resp.body).toEqual({"code": "tar", "description": null, "name": "Target"})
    });

    it('Responds with 404 if company is not found', async function () {
        const resp = await request(app).get(`/companies/mooo`);
        expect(resp.statusCode).toBe(404);
    });
});

