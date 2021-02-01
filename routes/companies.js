const db = require('../db');
const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError')

router.get('/', async (req, res, next) => {
    try {
        const companies = await db.query(
            `SELECT code, name 
             FROM companies`
        );
        return res.json({ "companies": companies.rows });
    } catch {
        const err = new ExpressError('Error with retrieving from database', 400);
        return next(err)
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        let companyRes = await db.query(
            `SELECT code, name, description
             FROM companies
             WHERE code=$1`, [req.params.code]
        );
        let company = companyRes.rows[0];

        if (companyRes.rows.length === 0) {
            const err = new ExpressError('Company Not Found', 400);
            return next(err);
        }

        return res.json(company);
    } catch {
        const err = new ExpressError('Company Not Found', 400);
        return next(err)
    }
});

module.exports = router;