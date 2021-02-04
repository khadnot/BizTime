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
        `INSERT INTO companies (id, comp_code, amt, paid, add_date, paid_date)
         VALUES (1, 'tar', 350, t, 2020-10-30, 2021-01-10)
         RETURNING id, comp_code, amt, paid, add_date, paid_date`
    );
    testComp = result.rows[0];
});
afterAll(async () => {
    await db.end()
});

