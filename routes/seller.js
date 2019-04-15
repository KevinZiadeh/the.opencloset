var express = require('express');
var router = express.Router();

//Become a Seller
router.get('/', ensureAuthenticated, (req, res)=>{
  res.render('./seller/seller', {
    title: 'Start Renting Clothes Today',
    user: req.user
  })
})

router.get('/dashboard', ensureAuthenticated, (req, res)=>{
  res.render('./seller/dashboard', {
    title: 'dashboard',
    user: req.user
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
