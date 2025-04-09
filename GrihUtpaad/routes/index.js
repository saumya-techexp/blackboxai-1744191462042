const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    currentPath: '/',
    error: req.flash('error') || [],
    success: req.flash('success') || []
  });
});

// About route
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Us',
    currentPath: '/about'
  });
});

module.exports = router;
