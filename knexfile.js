module.exports = {
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL + `?ssl=true`,
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds/dev',
    },
    useNullAsDefault: true,
  },
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://localhost/library',
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds/dev',
    },
    useNullAsDefault: true,
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://localhost/testing',
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds/testing',
    },
    useNullAsDefault: true,
  },
};
