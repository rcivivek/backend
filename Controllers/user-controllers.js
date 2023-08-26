const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    let hashedPassword;
    try{
      hashedPassword = await bcrypt.hash(password,12);
    }catch(err){
      const error = new HttpError('Could not create user, please try again', 500);
      return next(error);
    }
    const createdUser = new User({
      name,
      email,
      image: 'http://localhost:5000/'+ req.file.path,
      password : hashedPassword,
      places:[]
    });
  
    try{
        await createdUser.save();
    }catch(err){
        const error = new HttpError('Sign up failed, please try agine',500);
        return next(error);
    }
    
//   DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)
  let token;
  try{
    token = jwt.sign(
    {userId:createdUser.id,email: email},
    'supersecret_dont_share',
    {expiresIn: '1h'}
 );
  }catch(err){
     const error = new HttpError(
      'Signing up failed, please try again later.',
      500
      );
      return next(error);
  }
  

  res.status(201).json({
    userId: createdUser.id,
    email:createdUser.email,
    token:token});
  };

  const login = async (req, res, next) => {
    const { email, password } = req.body;
  
    let existingUser;
  
    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError(
        'Logging in failed, please try again later.',
        500
      );
      return next(error);
    }
  
    if (!existingUser) {
      const error = new HttpError(
        'Invalid credentials, could not log you in.',
        401
      );
      return next(error);
    }
  
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      const error = new HttpError(
        'Could not log you in, please check your credentials and try again.',
        500
      );
      return next(error);
    }
  
    if (!isValidPassword) {
      const error = new HttpError(
        'Invalid credentials, could not log you in.',
        401
      );
      return next(error);
    }
  
    let token;
    try {
      token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        'supersecret_dont_share',
        { expiresIn: '1h' }
      );
    } catch (err) {
      const error = new HttpError(
        'Logging in failed, please try again later.',
        500
      );
      return next(error);
    }
  
    res.json({
      userId: existingUser.id,
      email: existingUser.email,
      token: token
    });
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