const { query } = require("./database");

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return query(
    `
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
    `,
    [guest_id, limit]
  )
    .then((response) => {
      return response.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = {
  getAllReservations
};
