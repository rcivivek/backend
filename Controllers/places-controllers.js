// const uuid = require('uuid/v4');
const HttpError  = require('../models/http-error');

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

const getPlacesById = ((req,res,next) =>{
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p=>{
       return p.id === placeId
    });
    if(!place){
      throw new HttpError("Could not find a place.", 404)
    }
    res.json({place});
});

const getPlacesByUserId = (req,res,next)=>{
    const userId = req.params.uid;
    const places = DUMMY_PLACES.find(p=> p.creator===userId);
     
    if(!places){
        return next( new HttpError('Could not find a user. ', 404))
    }

    res.json({places});
};

const createPlace = (req, res,next)=>{
    const { title, description,coordinates,address,creator} = req.body;
    const createdPlace = {
        // id :uuid(),
        title,
        description,
        location:coordinates,
        address,
        creator
    };
    
  DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)

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