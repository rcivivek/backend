const express = require('express');
const {check}  = require('express-validator');

const router = express.Router();
const placeControllers = require('../Controllers/places-controllers');


router.get('/:pid',placeControllers.getPlacesById);

router.get('/user/:uid',placeControllers.getPlacesByUserId);

router.post('/',
  [check('title').not().isEmpty() ,
  check('description').isLength({min: 5}),
  check('address').not().isEmpty()],
   placeControllers.createPlace);

router.patch('/:pid' ,  placeControllers.updatePlace);

router.delete('/:pid',  placeControllers.deletePlace);

module.exports = router;