const db = require('../db');
const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError')

router.get('/', async (req, res, next) => {
    try {
        const invoices = await db.query(
            `SELECT id, comp_code, amt, paid
             FROM invoices`
        );
        return res.json({ 'invoices': invoices.rows });
    } catch {
        const err = new ExpressError('Error retrieving from database', 400);
        return next(err)
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        let invoiceRes = await db.query(
            `SELECT i.id,
                    i.comp_code,
                    i.amt,
                    i.paid,
                    i.add_date,
                    i.paid_date,
                    c.name,
                    c.description
            FROM invoices AS i
            JOIN companies AS c ON (i.comp_code = c.code)
            WHERE id = $1`, [req.params.id]
        );
        if (invoiceRes.rows.length === 0) {
            const err = new ExpressError('Invoice Not Found', 404);
            return next(err);
        };
        const result = invoiceRes.rows[0];
        let invoice = {
            'id': result.id,
            'amt': result.amt,
            'paid': result.paid,
            'add_date': result.add_date,
            'paid_date': result.paid_date
        };
        let company = {
            'code': result.comp_code,
            'name': result.name,
            'description': result.description 
        };
        return res.json({ 'invoice': invoice, 'company': company })
    } catch {
        const err = new ExpressError('Error retrieving from database', 400);
        return next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        let newInvoice = await db.query(
            `INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt] 
        );
        res.json({ 'invoice': newInvoice.rows })
    } catch {
        const err = new ExpressError('Error retrieving from database', 400);
        return next(err);
    }
});

module.exports = router