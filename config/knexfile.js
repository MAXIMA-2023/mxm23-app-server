// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: process.env.DB_CLIENT || 'mysql' ,
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '', 
      database: process.env.DB_NAME || 'db_maxima23'
    },
    debug: true,
    // log: {
    //   debug: (message) =>
    //     console.log(`[${new Date().toISOString()} - QUERY]: ${JSON.stringify(message)}`),
    //   warn: (message) =>
    //     console.error(`[${new Date().toISOString()} - WARN]: ${JSON.stringify(message)}`),
    //   error: (message) =>
    //     console.error(`[${new Date().toISOString()} - ERROR]: ${JSON.stringify(message)}`),
    // },
  },
  production: {
    client: process.env.DB_CLIENT || 'mysql' ,
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '', 
      database: process.env.DB_NAME || 'db_maxima23'
    },
    debug: true,
    // log: {
    //   debug: (message) =>
    //     console.log(`[${new Date().toISOString()} - QUERY]: ${message}`),
    //   warn: (message) =>
    //     console.error(`[${new Date().toISOString()} - WARN]: ${message}`),
    //   error: (message) =>
    //     console.error(`[${new Date().toISOString()} - ERROR]: ${message}`),
    // },
  }

  // staging: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },

  // production: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // }

};
