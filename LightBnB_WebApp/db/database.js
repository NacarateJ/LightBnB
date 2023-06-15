//////////////////////////////////////////////////////////////////////////////
//  Connect to the database
//////////////////////////////////////////////////////////////////////////////

// Pool is the prefered way to query with node-postgres,
// because it manages multiple client connections

const { Pool } = require("pg");

const config = {
  user: "vagrant",
  password: "123",
  host: "localhost",
  database: "lightbnb",
};

const pool = new Pool(config);

const query = function (queryString, queryParams) {
  return pool.query(queryString, queryParams);
};

module.exports = {
  query,
};
