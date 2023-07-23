const HttpError = require('../models/http-error');
const{ validationResult}  = require('express-validator');
const User = require('../models/user');

const DUMMY_USERS =[{
    first_name: "John",
    last_name: "Doe",
    username : "JohnDoe123",
    email: "johndeo12@gmail.com",
    password: "Nopassword",
}];

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
    const { name, email, password, places} = req.body;
  
    let existingUser
    try {
      existingUser = await User.findOne({ email: email })
    } catch (err) {
      const error = new HttpError(
        'Signing up failed, please try again later.',
        502
      );
      return next(error);
    }
    
    if (existingUser) {
      const error = new HttpError(
        'User exists already, please login instead.',
        422
      );
      return next(error);
    }
    
    const createdUser = new User({
      name,
      email,
      image: 'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg',
      password,
      places
    });
  
    try{
        await createdUser.save();
    }catch(err){
        const error = new HttpError('Sign up failed, please try agine',500);
        return next(error);
    }
    
//   DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)

  res.status(201).json({user: createdUser});
  };

const login = (req,res, next) =>{
    const {email, password} = req.body;
    const validUser = DUMMY_USERS.find(p=> p.email ===email&& p.password ===password);
    if(!validUser){
        throw new HttpError("Could not find any user", 404);
    }
    res.status(200).json({message:"You are logged in now.",validUser});

};

const  getAllUsers = (req,res, next)=>{
    res.status(200).json({DUMMY_USERS});
};


exports.signup  = signup;
exports.login = login;
exports.getAllUsers = getAllUsers;