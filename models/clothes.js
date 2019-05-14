const mongoose = require('mongoose');

// User Schema
const ClothesSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  type:{
    type: String,
    required: true,
  },
  seller_id:{
    type: String,
    required: true
  },
  price:{
    type: String,
    required: true
  },
  measurement:{
    type: String,
    required: true
  },
  description:{
    type: String
  },
  color: {
    type: String
  },
  sex:{
    type: String
  },
  brand:{
    type: String
  },
  attribute:{
    type: String,
    required: true
  }
});

let Clothes = module.exports = mongoose.model('Clothes', ClothesSchema);
