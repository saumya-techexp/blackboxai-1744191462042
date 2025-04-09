const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Middleware to check householder role
const isHouseholder = (req, res, next) => {
    if (req.session.user?.role === 'householder') return next();
    res.redirect('/auth/login');
};

// Householder dashboard
router.get('/', isHouseholder, async (req, res) => {
    try {
        const products = await Product.find({ householder: req.session.user._id });
        
        res.render('householder/dashboard', {
            title: 'My Dashboard',
            user: req.session.user,
            products
        });
    } catch (err) {
        console.error(err);
        res.redirect('/householder');
    }
});

// Add new product form
router.get('/products/new', isHouseholder, (req, res) => {
    res.render('householder/new-product', {
        title: 'Add New Product',
        user: req.session.user
    });
});

// Submit new product
router.post('/products', isHouseholder, async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        
        const product = new Product({
            name,
            description,
            price,
            category,
            householder: req.session.user._id
        });

        await product.save();
        res.redirect('/householder');
    } catch (err) {
        console.error(err);
        res.redirect('/householder/products/new');
    }
});

module.exports = router;
