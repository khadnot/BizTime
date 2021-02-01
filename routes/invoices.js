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


module.exports = router