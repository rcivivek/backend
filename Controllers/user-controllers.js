const HttpError = require('../models/http-error');
const{ validationResult}  = require('express-validator');
const User = require('../models/user');



const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
    const { name, email, password} = req.body;
  
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
      places:[]
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

  const login = async (req, res, next) => {
    const { email, password } = req.body;
  
    let existingUser;
  
    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError(
        'Loggin in failed, please try again later.',
        500
      );
      return next(error);
    }
  
    if (!existingUser || existingUser.password !== password) {
      const error = new HttpError(
        'Invalid credentials, could not log you in.',
        401
      );
      return next(error);
    }
  
    res.json({ message: 'Logged in!',user: existingUser.toObject({getters:true})});
  };

// const login = async (req,res, next) =>{
//     const {email, password} = req.body;
//     let validUser;
//     try{
//         validUser = await User.findOne({ email: email});
//     }catch(err){
//         return next(new HttpError("login failed",500));
//     }
//     if(!validUser || validUser.password != password){
//         return next(new HttpError("Either email or password is incorrect.", 404));
//     }
//       res.status(200).json({message:"You are logged in "});  
// };

const  getAllUsers = async (req,res, next)=>{
    let users;
    try{
        users = await User.find({}, '-password');
    }catch(err){
        return next(new HttpError("Could not get users", 500));
    }    
    res.status(200).json({users: users.map(user=>user.toObject({getters:true}))});
};


exports.signup  = signup;
exports.login = login;
exports.getAllUsers = getAllUsers;