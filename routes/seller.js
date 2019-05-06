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
let Clothes = require('../models/clothes.js')


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
               res.redirect('seller/dashboard');
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
Clothes.find({seller_id: req.user.id}, (err, items)=>{
    if (err){
      console.log(err);
    }else{
      res.render('./seller/dashboard', {
        title: 'Dashboard',
        seller: req.user,
        items: items
      })
    }
  })
})


//adding clothes
router.get('/add', ensureAuthenticated, (req, res)=>{
  res.render('./seller/add_clothes', {
    title: 'Add clothes',
    seller: req.user
  })
})

router.post('/add', ensureAuthenticated, [
  body('title').not().isEmpty().withMessage('Title is required'),
  body('measurement').not().isEmpty().withMessage('Size is required'),
  body('price').not().isEmpty().withMessage('Price is required').isDecimal().withMessage('Price  must be a number'),
], (req, res)=>{
  let errors = validationResult(req);
  if(!errors.isEmpty()){
   return res.render('./seller/add_clothes', {
     errors:errors.mapped(),
     title: 'Add clothes',
     seller: req.user
   });
 }else{
   var newClothes= Clothes({
     title: req.body.title,
     type: req.body.type,
     price: req.body.price,
     measurement: req.body.measurement,
     description: req.body.description,
     color: req.body.color,
     seller_id: req.user._id
   })
     newClothes.save()
     req.flash('success', 'You have successfully added an item')
     res.redirect('/seller/dashboard')
   }
})

//edit clothes
router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
  pth = req.originalUrl.split('/')
  id = pth[pth.length-1];
  Clothes.findById(id, (err, item) => {
    if (item.seller_id !== req.user.id){
      res.redirect('/')
    }
    if (err){
      res.redirect('/')
    }
    res.render('./seller/edit_clothes', {
      title: 'Edit item',
      seller: req.user,
      item: item
    })
  })
})

router.post('/edit/:id', ensureAuthenticated, [
  body('title').not().isEmpty().withMessage('Title is required'),
  body('measurement').not().isEmpty().withMessage('Size is required'),
  body('price').not().isEmpty().withMessage('Price is required').isDecimal().withMessage('Price  must be a number'),
], (req, res)=>{
  pth = req.originalUrl.split('/')
  id = pth[pth.length-1];
  Clothes.findById(id, (err, item) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()){
     return res.render('./seller/edit_clothes', {
       errors:errors.mapped(),
       title: 'Add clothes',
       seller: req.user,
       item: item
     });
   }else{
     var updatedItem= {
       title: req.body.title,
       type: req.body.type,
       price: req.body.price,
       measurement: req.body.measurement,
       description: req.body.description,
       color: req.body.color,
       seller_id: req.user._id
     }
     Clothes.update({_id: req.params.id, seller_id: req.user.id}, updatedItem, (err, item)=>{
       if (err){
         console.log(err);
       }else{
         req.flash('success', 'You have successfully updated an item')
         res.redirect('/seller/dashboard')
       }
       })
     }
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
