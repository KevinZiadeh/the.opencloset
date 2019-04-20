var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer')

//var fs = require('fs')
const admin = require('../config/admin');

/* GET home page.
router.get('/', function(req, res, next) {
  fs.readFile('./views/main.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
});
*/

router.get('/', (req, res) => {
  res.render('main', {
    title: 'Dare to Share'
  })
})

router.post('/contact_us', (req, res) =>{
  console.log(req.body.contact_us);
  console.log(req.user);
  var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: admin.email,
    pass: admin.pass
  }
});

var mailOptions = {
  from: req.user.email,
  to: admin.email,
  subject: 'Contact Us Form',
  text: req.body.contact_us
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
  req.flash('Thank you for your inquiry! We will get back to you within 48 hours.')
  res.redirect('/')
})

module.exports = router;
