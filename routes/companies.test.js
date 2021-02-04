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

describe('POST /companies route', function () {
    it('Creates a new company to add to the database', async function () {
        const resp = await request(app)
                           .post('/companies')
                           .send({
                               name: 'Wal-Mart',
                               description: 'Cheap Evil Corporation'
                           });
        expect(resp.statusCode).toBe(200);
        expect(resp.body.company[0]).toHaveProperty('name');
        expect(resp.body.company[0]).toHaveProperty('code');
        expect(resp.body.company[0]).toHaveProperty('description');
        expect(resp.body.company[0].name).toEqual('Wal-Mart');
        expect(resp.body.company[0].code).toEqual('wal-mart');
        expect(resp.body.company[0].description).toEqual('Cheap Evil Corporation');
    });
});

describe('PUT /companies route', function () {
    it('Updates a company in the database', async function () {
        const resp = await request(app)
                          .put('/companies/tar')
                          .send({
                            name: 'Verizon',
                            description: 'Evil Phone Corporation'
                          });
        expect(resp.statusCode).toBe(200);
        expect(resp.body.company[0]).toHaveProperty('name');
        expect(resp.body.company[0]).toHaveProperty('code');
        expect(resp.body.company[0]).toHaveProperty('description');
        expect(resp.body.company[0].name).toEqual('Verizon');
        expect(resp.body.company[0].code).toEqual('tar');
        expect(resp.body.company[0].description).toEqual('Evil Phone Corporation');
    });

    it('Responds with a 404 if company can not be found', async function () {
        const resp = await request(app).put('/companies/tarp');
        expect(resp.statusCode).toBe(404);
    });
});

describe('DELETE /companies/code route', function () {
    it('Deletes a single company from the database', async function () {
        const resp = await request(app)
                           .delete('/companies/tar');
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ message: 'deleted' })
    })
})