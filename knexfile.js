module.exports = {
  production: {
    client: 'pg',
    connection: 'postgres://localhost/library',
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/dev'
    },
    useNullAsDefault: true
  },
  testing: {
    client: 'pg',
    connection: 'postgres://localhost/testing',
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/testing'
    },
    useNullAsDefault: true
  }
};
