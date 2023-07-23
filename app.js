const express = require('express');
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');


const placesRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/user-routes');
const HttpError = require('./models/http-error');


const app = express();

app.use(bodyParser.json());


app.use('/api/user',userRoutes);

app.use('/api/places',placesRoutes);

app.use((req,res, next)=>{
   const error = new HttpError('Could not  find this route.', 404);
   throw error;
});

app.use((error, req,res,next) =>{
   if(res.headerSent){
    return next(error);
   }
   res.status(error.code || 500)
   res.json({message: error.message || 'Unknown Error'})
});

mongoose.connect('mongodb+srv://Mongo:123@cluster0.6owdhvz.mongodb.net/places?retryWrites=true&w=majority')
        .then(()=>{
            app.listen(5000);
        })
        .catch(err =>{
         console.log(err);
        });
