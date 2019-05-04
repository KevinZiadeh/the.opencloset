var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const nodemailer = require('nodemailer')
const mongoose = require('mongoose');
const async = require('async');
const { check, body, validationResult } = require('express-validator/check');
// const crypto = require('crypto');
const config = require('../config/database');
const admin = require('../config/admin');

//Bring in models
let User = require('../models/user.js')

//Become a Seller
router.get('/', ensureAuthenticated, (req, res)=>{
  res.render('./seller/seller', {
    title: 'Start Renting Clothes Today',
    seller: req.user
  })
})

//Post request
router.post('/', ensureAuthenticated, [
  body('location').not().isEmpty().withMessage('Location is required'),
  body('phone_number').not().isEmpty().withMessage('Phone number is required')
],(req, res)=>{
  User.findById(req.user.id, (err, user)=>{
    bcrypt.compare(req.body.password.trim(), user.password, function(err, isMatch){
      if(err) throw err;
      if(isMatch){
        //Get Errors
        let errors = validationResult(req);
        const location = req.body.location
        const phone_number = req.body.phone_number
        if(!errors.isEmpty()){
         return res.render('./seller/seller', {
           errors:errors.mapped(),
           title: 'Register',
           seller: req.user
         });
       }else{
         update ={}
         update.location = location
         update.phone_number = phone_number
         update.seller_status = true
         User.findByIdAndUpdate(req.user.id, update, (err, user) => {
             if(err){
               console.log(err);
               return
             } else{
               req.flash('success','You are now a seller');
               res.redirect('seller//dashboard');
             }
           })
       }
      } else {
        req.flash('danger', 'Password is incorrect');
        res.redirect('/seller')
      }
    })
  })
})


router.get('/dashboard', ensureAuthenticated, (req, res)=>{
  res.render('./seller/dashboard', {
    title: 'dashboard',
    seller: req.user
  })
})

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}
module.exports = router;
