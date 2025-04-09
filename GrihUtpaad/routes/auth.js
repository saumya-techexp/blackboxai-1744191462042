const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register routes
router.get('/register', (req, res) => {
    res.render('auth/register', { 
        title: 'Register',
        user: req.user 
    });
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await user.save();
        req.session.user = user;
        res.redirect(`/${role}`);
    } catch (err) {
        console.error(err);
        res.redirect('/auth/register');
    }
});

// Login routes
router.get('/login', (req, res) => {
    res.render('auth/login', { 
        title: 'Login',
        user: req.user 
    });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.redirect('/auth/login');
        }

        req.session.user = user;
        res.redirect(`/${user.role}`);
    } catch (err) {
        console.error(err);
        res.redirect('/auth/login');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
