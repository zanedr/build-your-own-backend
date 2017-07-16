const environment = process.env.NODE_ENV || 'production';
const configuration = require('../knexfile')[environment];

module.exports = require('knex')(configuration);
