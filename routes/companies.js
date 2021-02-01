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
        return res.json({ 'companies': companies.rows });
    } catch {
        const err = new ExpressError('Error retrieving from database', 400);
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
            const err = new ExpressError('Company Not Found', 404);
            return next(err);
        }

        return res.json(company);
    } catch {
        const err = new ExpressError('Error retrieving from database', 400);
        return next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        let newCompany = await db.query(
            `INSERT INTO companies
             VALUES ($1, $2, $3)
             RETURNING code, name, description`, [code, name, description]
        );
        res.json({ 'company': newCompany.rows });
    } catch {
        const err = new ExpressError('Error adding company to database', 400);
        return next(err);
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        let code = req.params.code;
        let editCompany = await db.query(
            `UPDATE companies
             SET name = $1, description = $2
             WHERE code = $3
             RETURNING code, name, description`, [name, description, code]
        );
        if (editCompany.rows.length === 0) {
            const err = new ExpressError('Company not found', 404);
            return next(err);
        };
        res.json({ 'company': editCompany.rows })
    } catch {
        const err = new ExpressError('Error retrieving from database', 400);
        return next(err);
    }
})



module.exports = router;