const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Middleware to check consumer role
const isConsumer = (req, res, next) => {
    if (req.session.user?.role === 'consumer') return next();
    res.redirect('/auth/login');
};

// Consumer dashboard - browse approved products
router.get('/', isConsumer, async (req, res) => {
    try {
        const products = await Product.find({ status: 'approved' })
            .populate('householder', 'name');
            
        res.render('consumer/dashboard', {
            title: 'Browse Products',
            user: req.session.user,
            products
        });
    } catch (err) {
        console.error(err);
        res.redirect('/consumer');
    }
});

// Product details page
router.get('/products/:id', isConsumer, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('householder', 'name');
            
        if (!product || product.status !== 'approved') {
            return res.redirect('/consumer');
        }

        res.render('consumer/product-details', {
            title: product.name,
            user: req.session.user,
            product
        });
    } catch (err) {
        console.error(err);
        res.redirect('/consumer');
    }
});

module.exports = router;
