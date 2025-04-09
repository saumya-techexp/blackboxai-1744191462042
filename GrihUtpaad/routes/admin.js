const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Middleware to check admin role
const isAdmin = (req, res, next) => {
    if (req.session.user?.role === 'admin') return next();
    res.redirect('/auth/login');
};

// Admin dashboard
router.get('/', isAdmin, async (req, res) => {
    try {
        const pendingProducts = await Product.find({ status: 'pending' })
            .populate('householder', 'name email');
            
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.session.user,
            pendingProducts
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

// Approve/reject products
router.post('/products/:id/status', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await Product.findByIdAndUpdate(id, { status });
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

module.exports = router;
