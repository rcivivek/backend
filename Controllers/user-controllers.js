const HttpError = require('../models/http-error');
const{ validationResult}  = require('express-validator');

const DUMMY_USERS =[{
    first_name: "John",
    last_name: "Doe",
    username : "JohnDoe123",
    email: "johndeo12@gmail.com",
    password: "Nopassword",
}];

const signup= (req,res, next)=>{
    const errors = validationResult(req);
    if(!errors){
        console.log(errors);
        throw new HttpError("Invalid inputs, Please inputs valid data",422 );
    }
    const {name, email, password} = req.body;
    const newUser = {username, first_name,last_name,email,password};
    res.status(201).json({newUser,message:"Registration Successful."});
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