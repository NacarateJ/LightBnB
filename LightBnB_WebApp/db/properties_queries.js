const { query } = require("./database");

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

  return query(queryString, queryParams)
  // pool
  //   .query(queryString, queryParams)
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
  return query(
      `
    INSERT INTO properties(
      title,
      description,
      owner_id,
      cover_photo_url,
      thumbnail_photo_url,
      cost_per_night,
      parking_spaces,
      number_of_bathrooms,
      number_of_bedrooms,
      province,
      city,
      country,
      street,
      post_code
    )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
    `,
      [
        property.title,
        property.description,
        property.owner_id,
        property.cover_photo_url,
        property.thumbnail_photo_url,
        property.cost_per_night,
        property.parking_spaces,
        property.number_of_bathrooms,
        property.number_of_bedrooms,
        property.province,
        property.city,
        property.country,
        property.street,
        property.post_code,
      ]
    )
    .then((response) => {
      return response.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = {
  getAllProperties,
  addProperty
};