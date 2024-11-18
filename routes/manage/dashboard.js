const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/manage/dashboard');
});

router.get('/dashboard', (req, res) => {
    if (!res.locals.user) {
        return res.status(401).redirect('/login');
    }

    res.render('manage/pages/dashboard', {
        currentPage: 'dashboard',
        username: res.locals.user.username,
        uuid: res.locals.user.userId
    });
});

module.exports = router;