const mongoose = require('mongoose');

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

let User = module.exports = mongoose.model('User', UserSchema);
