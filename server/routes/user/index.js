var express = require('express');
var router = express.Router();
var ctrl = require('./controller.js');

router.get('/me/:id', ctrl.displayMyInfo);
router.get('/other/:username', ctrl.displayOtherInfo);

router.post('/me/:id/:type', ctrl.changeMyInfo);
router.post('/addview', ctrl.addView);
router.post('/deleteview', ctrl.delView);
router.post('/editLang/:id/:lang', ctrl.editLang);

module.exports = router;
