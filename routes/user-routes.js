const express = require('express');
const {check} = require('express-validator');

const fileUpload = require('../middleware/file-upload');

const router = express.Router();

const userControllers = require('../Controllers/user-controllers');
router.get('/',userControllers.getAllUsers);

router.post('/signup',
fileUpload.single('image'),
[check('name').not().isEmpty() ,
check('email').normalizeEmail().isEmail(),
check('password').isLength({min:6})],
 userControllers.signup);

router.post('/login',userControllers.login)

module.exports = router;




