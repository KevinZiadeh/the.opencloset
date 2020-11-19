let Admin = require('./admin');

module.exports = {
  database:process.env.MONGODB_URI || 'mongodb://'+Admin.mlabuser+':'+Admin.mlabpass+'@ds247310.mlab.com:47310/theopencloset',
  secret:'mysecret'
};
