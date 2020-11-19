const mongoose = require('mongoose');

// User Schema
const ClothesSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  type:{
    type: Array,
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
    type: Array,
    //type: Mixed,
    required: true
  },
  description:{
    type: String
  },
  color: {
    type: Array
  },
  sex:{
    type: String
  },
  brand:{
    type: String
  },
  attribute:{
    type: Array,
    required: true
  }
});

let Clothes = module.exports = mongoose.model('Clothes', ClothesSchema);
