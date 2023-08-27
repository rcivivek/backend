// const uuid = require('uuid/v4');
const  fs = require('fs');

const HttpError  = require('../models/http-error');
const mongoose = require('mongoose');
const { validationResult}  = require('express-validator');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');



const getPlacesById = ( async(req,res,next) =>{
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId);        
    }catch(err){
        const error = new HttpError(
            'Something went wrong, could nout find a place',
            500
        );
        return next(error);

    }
    if(!place){
      const error =new HttpError("Could not find a place.", 404)
      return next(error );
    }
    res.json({place:place.toObject({getters: true}) });
});

const getPlacesByUserId = async (req,res,next)=>{
    const userId = req.params.uid;
    let places;
    try{
        places =  await Place.find({creator: userId});        

    }catch(err){
       const error = new HttpError('Something went wrong.', 500);
       return next(error);
    }

    if(!places|| places.length==0){
        return next( new HttpError('Could not find a user. ', 404))
    }

    res.json({places:places.map(place=> place.toObject({getters:true}))});
};

const createPlace = async (req, res,next)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors);
      return  next(new HttpError('Invalid inputs passed, please check your data.',422));
    }
    const coordinates = {
        lat: 40.23245,
        lng: -34.34455
    };
    const { title, description,address} = req.body;
  
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image:  req.file.path,       
        creator: req.userData.userId
      });
    
      let user;
      try {
        user = await User.findById(req.userData.userId);
      } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500);
        return next(error);
      }
    
      if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
      }
    
      console.log(user);
    
      try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
      } catch (err) {
        const error = new HttpError(
          'Creating place failed, please try again.',
          500
        );
        return next(error);
      }
    
      res.status(201).json({ place: createdPlace });
    };

const updatePlace = async(req, res, next) => {
    // const errors =validationResult(req);
    // if(!errors.isEmpty()){
    //     throw new HttpError('Invalid inputs passed, please check your data.',422);
    // }
    const placeId =req.params.pid;
    const { title, description} = req.body;
    let place;
    try{
        place = await Place.findById(placeId);
    }catch(err){
        const error = new HttpError('Something wen wrong, coould not update place',500);
        return next(error);
    }
     
    if(place.creator.toString() !==req.userData.userId){
      const error = new HttpError('You are not allowed to edit this place.',401);
      return next(error);

    }

    place.title = title;
    place.description = description;
    try{
       await place.save();     

    }catch(err){
        return next(new HttpError('Could not update place',500));
    }

    res.status(202).json({place: place.toObject({getters: true})});
};

const deletePlace = async (req, res, next)=>{
   const placeId = req.params.pid;
   let place;
   try{
      place = await Place.findById(placeId).populate('creator');
   }catch(err){
    return next(new HttpError('Could not delete place',500));
   }
   if(!place)return  next(new HttpError("Could not find place for this id.", 404));
 
   if(place.creator.id !==req.userData.userId){
      const error = new HttpError('You are not allowed to delete this id.', 401);
      return next(error);
   }
   
   const imagePath = place.image

   try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();

   }catch(err){
    return next(new HttpError('Something went Wrong', 494));
   }
   fs.unlink(imagePath,err =>{
    console.log(err);
   });
   res.status(203).json({message:"Deleted place."});
};

exports.getPlacesById = getPlacesById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;