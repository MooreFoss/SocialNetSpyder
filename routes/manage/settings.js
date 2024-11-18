const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('manage/pages/settings', {
        currentPage: 'settings',
        username: res.locals.user.username
    });
});

module.exports = router;