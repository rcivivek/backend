// const uuid = require('uuid/v4');
const HttpError  = require('../models/http-error');
const { validationResult}  = require('express-validator');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');


const DUMMY_PLACES = [{
    id: 'p1',
    title : 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
        lat: 40.7484474,
        lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'

}];

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
    const { title, description,address,creator} = req.body;
    
    const createdPlace = new Place({
        title,
        description,
        address,
        location:coordinates,
        image:'https://en.wikipedia.org/wiki/Taj_Mahal#/media/File:Taj_Mahal-10_(cropped).jpg',
        creator
    });
    try{
        await createdPlace.save();

    }catch(err){
        const error = new HttpError('createing place failed, please try agine',500);
        return next(error);
    }
    
//   DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)

  res.status(201).json({place: createdPlace});
};

const updatePlace = (req, res, next) => {
    const placeId =req.params.pid;
    const { title, description,coordinates,address,creator} = req.body;
    const createdPlace = {
        // id :uuid(),
        title,
        description,
        location:coordinates,
        address,
        creator
    };
    res.status(202).json({place: createdPlace});
};

const deletePlace = (req, res, next)=>{
   const placeId = req.params.pid;
   const place = DUMMY_PLACES.find(p=>p.id===placeId);
   res.status(203).json({place});
};

exports.getPlacesById = getPlacesById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;