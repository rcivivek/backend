const express = require('express');

const router = express.Router();

const HttpError  = require('../models/http-error');


router.get('/:pid',);

router.get('/user/:uid',(req,res,next)=>{
    const userId = req.params.uid;
    const places = DUMMY_PLACES.find(p=> p.creator===userId);
     
    if(!places){
        return next( new HttpError('Could not find a user. ', 404))
    }

    res.json({places});
});

module.exports = router;