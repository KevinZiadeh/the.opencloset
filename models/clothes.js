const mongoose = require('mongoose');

// User Schema
const ClothesSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  seller_id:{
    type: String,
    required: true
  },
  price:{
    type: String,
    required: true
  },
  size:{
    type: String,
    required: true
  },
  description:{
    type: String
  }
});

let Clothes = module.exports = mongoose.model('Clothes', ClothesSchema);
