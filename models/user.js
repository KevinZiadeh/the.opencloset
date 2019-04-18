const mongoose = require('mongoose');
//const uniqueValidator = require('mongoose-unique-validator');

// User Schema
const UserSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: false,
    unique: true,
    //uniqueCaseInsensitive: true
  },
  username:{
    type: String,
    required: true,
    unique: true,
  },
  location:{
    type: String,
  },
  phone_number:{
    type: Number,
  },
  password:{
    type: String,
    required: true
  },
  preferences:{
    type: Object
  },
  seller_status:{
    type: Boolean
  },
  created_at: Date,
  updated_at: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// Apply the uniqueValidator plugin to userSchema.
//UserSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' } );
let User = module.exports = mongoose.model('User', UserSchema);
