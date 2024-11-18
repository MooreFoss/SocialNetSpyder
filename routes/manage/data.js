const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('manage/pages/data', {
        currentPage: 'data',
        username: res.locals.user.username
    });
});

module.exports = router;