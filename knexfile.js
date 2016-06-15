module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/sommbuddy'
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
};
