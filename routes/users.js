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

//User Registeration
//Get request
router.get('/register', (req, res) => {
  res.render('./user/register', {
    title: 'Register'
  })
})

//Post request
router.post('/register', [
  body('name').not().isEmpty().withMessage('Name is required').isAlpha().withMessage('Name must be only letters'),
  body('email').isEmail().withMessage('Email is not valid').custom(async (value, { req }) =>{
    let mail_taken = await taken({email: req.body.email.toLowerCase().trim()});
    if (mail_taken){
      throw new Error('Email is already taken')
    };
    return true
  }),
  body('username').not().isEmpty().withMessage('Username is required').custom(async (value, { req }) =>{
    let user_taken = await taken({username: req.body.username.toLowerCase().trim()});
    if (user_taken){
      throw new Error('Username is already taken')
    };
    return true
  }),
  body('password').not().isEmpty().withMessage('Password is required').isLength({min: 8}).withMessage('Password is too short'),
  body('password2').not().isEmpty().withMessage('Please confirm your password'),
  body('password2').custom((value, { req }) => {
  if (value !== req.body.password) {
    throw new Error('Passwords do not match');
  }
  return true
})
],(req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  //Get Errors
  let errors = validationResult(req);
  if(!errors.isEmpty()){
   return res.render('./user/register', {
     errors:errors.mapped(),
     title: 'Register'
   });
 } else {
     var newUser = new User({
       name:name,
       email:email.toLowerCase().trim(),
       username:username.toLowerCase().trim(),
       password:password.trim(),
       seller_status: false,
       preferences: {},
       created_at: new Date().toDateString()
     });
     bcrypt.genSalt(10, function(err, salt){
       bcrypt.hash(newUser.password, salt, function(err, hash){
         if(err){
           console.log(err);
         }
         newUser.password = hash;
         newUser.save()
       })
     });
   }
   req.flash('success', 'Thank you for registering')
   res.render('./user/login', {
     title: 'Welcome',
   })
})


//Login page
//Local Strategy
//GET request
router.get('/login', (req, res) => {
  res.render('./user/login', {
    title: 'Login'
  })
})

//POST Request
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})


//Facebook Strategy
// router.get('/login/facebook',
//   passport.authenticate('facebook'));
//
// router.get('/login/facebook/return',
//   passport.authenticate('facebook', { failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect('/');
//   });


// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});


//User page
router.get('/:id', ensureAuthenticated, function(req, res){
  pth = req.originalUrl.split('/')
  id = pth[pth.length-1];
  User.findById(id, (err, user) => {
    if (err){
      res.redirect('/')
    }
    res.render('./user/user', {
      title: req.user.name,
      user: user
    })
  })
});


// Edit information
// GET request
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  pth = req.originalUrl.split('/')
  id = pth[pth.length-1];
  User.findById(id, (err, user) => {
    res.render('./user/edit_user', {
      title: 'Edit User',
      user: user
    })
  })
});

//POST request
router.post('/edit/:id', ensureAuthenticated, [
  body('password').not().isEmpty().withMessage('Password is required')
], (req, res) => {
  pth = req.originalUrl.split('/')
  id = pth[pth.length-1];
  // const password = req.body.password.trim();
  // console.log(req.body);

  // Match Password
  User.findById(id, (err, user) => {
    bcrypt.compare(req.body.password.trim(), user.password, function(err, isMatch){
      if(err) throw err;
      if(isMatch){
        //Get Errors
        let errors = req.validationErrors();
        const name = req.body.name;
        const email = req.body.email.toLowerCase().trim();
        const username = req.body.username.toLowerCase().trim();
        const fav_color = (req.body.fav_color == 'Select your favorite color:' ? user.preferences.fav_color : req.body.fav_color)
        const fav_type = (req.body.fav_type == 'Select your favorite type:' ? user.preferences.fav_type : req.body.fav_type)
        const location = req.body.location;
        console.log(user);
          if(errors){
            User.findById(id, (err, user) => {
              if (err) {
                console.log(err)
              } else{
                res.render('./user/edit_user', {
                  title: 'Edit Information',
                  user: user,
                  errors:errors
                });
              }
            })
          } else {
             let user = {};
             user.name = name;
             user.email = email.toLowerCase().trim();
             user.username = username.toLowerCase().trim();
             user.preferences = {
               fav_color: fav_color,
               fav_type: fav_type
             }
             // user.location = location
             updated_at = new Date()
             let query = {_id: req.params.id}

             User.update(query, user, (err, user) => {
                 if(err){
                   console.log(err);
                   return
                 } else{
                   req.flash('success','User Updated');
                   res.redirect('/');
                 }
               })
             // })
           }
      } else {
        req.flash('danger','Password is incorrect');
        res.redirect('/users/edit/'+user.id);
      }
    })
  })
})

// Edit Password
router.get('/edit_password/:id', ensureAuthenticated, function(req, res){
  pth = req.originalUrl.split('/')
  id = pth[pth.length-1];
  User.findById(id, (err, user) => {
    res.render('./user/edit_password', {
      title: 'Edit Password',
      user: user
    })
  })
});
//Post request
router.post('/edit_password/:id', ensureAuthenticated, [
  body('newpassword').not().isEmpty().withMessage('New password is required'),
  body('newpassword2').custom((value, { req }) => {
  if (value !== req.body.newpassword) {
    throw new Error('Passwords do not match');
  }
  return true
})
], (req, res) => {
  pth = req.originalUrl.split('/')
  id = pth[pth.length-1];
  const oldpassword = req.body.oldpassword.trim();
  const newpassword = req.body.newpassword.trim();
  const newpassword2 = req.body.newpassword2.trim();

  // Match Password
  User.findById(id, (err, user) => {
    bcrypt.compare(oldpassword, user.password, function(err, isMatch){
      if(err) throw err;
      if(isMatch){
        //Get Errors
        let errors = req.validationErrors();

          if(errors){
            User.findById(req.user._id, (err, user) => {
              if (err) {
                console.log(err)
              } else{
                res.render('./user/edit_user', {
                  title: 'Edit Information',
                  user: user,
                  errors:errors
                });
              }
            })
          } else {
             let user = {};
             user.password = newpassword;
             updated_at = new Date()
               bcrypt.genSalt(10, function(err, salt){
                 bcrypt.hash(user.password, salt, function(err, hash){
                   if(err){
                     console.log(err);
                   }
                   user.password = hash

                 let query = {_id: req.params.id}

                 User.update(query, user, (err, user) => {
                   if(err){
                     console.log(err);
                     return
                   } else{
                     req.flash('success','Password Updated');
                     res.redirect('/');
                   }
                 })
               })
             })
           }
      } else {
        req.flash('danger','Old password is incorrect');
        res.redirect('/users/edit_password/'+user.id);
      }
    })
  })
})

//forgot password
router.get('/forgot', (req, res) => {
  res.render('./user/forgot', {
    title: 'Reset Password',
    user: req.user
  })
})

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          res.redirect('/users/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: admin.email,
          pass: admin.pass
        }
      });
      var mailOptions = {
        to: user.email,
        from: admin.email,
        subject: 'Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/users/forgot');
  });
});

//reset password
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      res.redirect('/users/forgot');
    }
    res.render('./user/reset', {
      user: req.user
    });
  });
});

router.post('/reset/:token', function(req, res) {
  const password = req.body.password;
  const confirm = req.body.confirm;

  req.checkBody('password','Password is required').notEmpty();
  req.checkBody('confirm','Passwords do not match').equals(req.body.password);

  //Get Errors
  let errors = req.validationErrors();

  if(errors){
   res.render('./user/reset', {
     errors:errors,
     title: 'Reset Password'
   });
  } else {
      async.waterfall([
        function(done) {
          User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              res.redirect('back');
            }

            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            bcrypt.genSalt(10, function(err, salt){
              bcrypt.hash(user.password, salt, function(err, hash){
                if(err){
                  console.log(err);
                }
                user.password = hash

                user.save(function(err) {
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                });
              })
            })
          });
        },
        function(user, done) {
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: admin.email,
              pass: admin.pass
            }
          });
          var mailOptions = {
            to: user.email,
            from: admin.email,
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
          };
          transporter.sendMail(mailOptions, function(err) {
            req.flash('success', 'Success! Your password has been changed.');
            done(err);
          });
        }
      ], function(err) {
        res.redirect('/');
      });
  }
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

async function taken(query){
    let user = await User.findOne(query)
    if (user){
      return true
    }else{
      return false
    }
}
module.exports = router;
