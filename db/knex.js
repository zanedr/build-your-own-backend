const environment = 'testing';
const config = require('../knexfile')[environment];

module.exports = require('knex')(config);
