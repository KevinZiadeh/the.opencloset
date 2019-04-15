var express = require('express');
var router = express.Router();


// clothes Model
let clothes = require('../models/clothes');
// User Model
let User = require('../models/user');


/* GET home page. */
router.get('/', function(req, res, next) {
  clothes.find({}, function(err, closet){
    if(err){
      console.log(err)
    } else{
      res.render('./closet/closet', {
        title: 'Closet',
        closet: closet
      });
    }
  });
});


// Add clothes
// Add Submit clothes Route
router.post('/', ensureAuthenticated, function(req, res){
  req.checkBody('title','Title is required').notEmpty();
  req.checkBody('body','Description is required').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if(errors){
    clothes.find({}, function(err, closet){
      if(err){
        console.log(err)
      } else{
        res.render('./closet/closet', {
          title: 'clothes List',
          closet: closet,
          errors: errors
        });
      }
    });
  } else {
    let clothes = new clothes();
    clothes.title = req.body.title;
    clothes.author = req.user._id;
    clothes.body = req.body.body;z
    clothes.date = new Date().toDateString();

    clothes.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success','clothes Added');
        res.redirect('/closet');
      }
    });
  }
});


//Edit clothes
//Add GET request
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  clothes.findById(req.params.id, (err, clothes) => {
    if(err){
      console.log(err)
    }if (clothes.author != req.user._id) {
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    } else{
        res.render('./closet/edit_clothes', {
          title: 'Edit Info',
          clothes: clothes
        })
    }
  })
});

// clothes request
router.post('/edit/:id', (req, res) => {
  req.checkBody('title','Title is required').notEmpty();
  req.checkBody('body','Description is required').notEmpty();

  //Get Errors
  let errors = req.validationErrors();

  if(errors){
    clothes.find({}, function(err, closet){
      if(err){
        console.log(err)
      } else{
        res.render('./closet/closet', {
          title: 'clothes List',
          closet: closet,
          errors: errors
        });
      }
    });
  } else {
      let clothes = {};
      clothes.title = req.body.title;
      clothes.body = req.body.body;
      clothes.date = new Date().toDateString();

      let query = {_id: req.params.id}

      clothes.update(query, clothes, (err, clothes) => {
        if(err){
          console.log(err);
          return
        } else{
          req.flash('success','clothes Updated');
          res.redirect('/closet/'+req.params.id);
        }
      })
    }
});


// Delete User
router.delete('/:id', function(req, res){
  if(!req.user._id){
  res.status(500).send();
}

  let query = {_id:req.params.id}

  clothes.findById(req.params.id, function(err, clothes){
    if(clothes.author != req.user._id){
      res.status(500).send();
    } else {
      clothes.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});


//Get Single clothes
router.get('/:id', function(req, res){
  clothes.findById(req.params.id, (err, clothes) => {
    User.findById(req.user._id, (err, user) => {
        res.render('clothes', {
          title: 'clothes by ' +user.name,
          author: user.name,
          clothes: clothes
        })
      })
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
