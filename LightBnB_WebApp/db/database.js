const properties = require("./json/properties.json");
const users = require("./json/users.json");

//////////////////////////////////////////////////////////////////////////////
//  Connect to the database
//////////////////////////////////////////////////////////////////////////////

// Pool is the prefered way to query with node-postgres,
// because it manages multiple client connections
const { Pool } = require("pg");

const pool = new Pool({
  user: "vagrant",
  password: "123",
  host: "localhost",
  database: "lightbnb",
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [email])
    .then((response) => {
      if (response.rows.length > 0) {
        return response.rows[0];
      } else {
        return null;
       }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((response) => {
      if (response.rows.length > 0) {
        return response.rows[0];
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
  };


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool
    .query(
      `INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *`,
      [user.name, user.email, user.password]
    )
    .then((response) => {
      return response.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(`
    SELECT 
      reservations.*,
      properties.*,
      AVG(property_reviews.rating) AS average_rating
    FROM 
      reservations
    JOIN 
      properties ON properties.id = reservations.property_id
    JOIN 
      property_reviews ON property_reviews.property_id = properties.id
    WHERE 
      reservations.guest_id = $1
    GROUP BY 
      properties.id, reservations.id
    ORDER BY 
      reservations.start_date
    LIMIT 
      $2
    `, [guest_id, limit]
    )
    .then((response) => {
      return response.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {
  const queryParams = [];

  let queryString = `
    SELECT
      properties.*,
      AVG(property_reviews.rating) AS average_rating
    FROM
      properties
    JOIN
      property_reviews ON property_id = properties.id
  `;

  const addQueryParam = function(value) {
    queryParams.push(value);
  };

  const addClause = function(condition) {
    queryString += condition;
  };


  if (options.city) {
    addQueryParam(`%${options.city}%`);
    addClause(`WHERE city LIKE $${queryParams.length}`);
  }
  if (options.owner_id) {
    addQueryParam(options.owner_id);
    addClause(` AND owner_id = $${queryParams.length}`);
  }
  if (options.minimum_price_per_night) {
    addQueryParam(options.minimum_price_per_night);
    addClause(` AND cost_per_night / 100 >= $${queryParams.length}`);
  }
  if (options.maximum_price_per_night) {
    addQueryParam(options.maximum_price_per_night);
    addClause(` AND cost_per_night / 100 <= $${queryParams.length}`);
  }

  queryString += `
    GROUP BY
      properties.id
  `;

  if (options.minimum_rating) {
    addQueryParam(options.minimum_rating);
    addClause(` HAVING AVG(property_reviews.rating) >= $${queryParams.length}`);
  }

  queryParams.push(limit);

  queryString += `    
    ORDER BY
      cost_per_night
    LIMIT 
      $${queryParams.length}
  `;

  return pool
    .query(queryString, queryParams)
    .then((response) => {
      return response.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};