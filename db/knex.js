const environment = process.env.DATABASE_URL || 'testing';
const config = require('../knexfile')[environment];

module.exports = require('knex')(config);
