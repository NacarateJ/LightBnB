const { query } = require("./database");

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function(email) {
  return query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [email])
  // pool
  //   .query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [email])
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
  return query(`SELECT * FROM users WHERE id = $1`, [id])
      // pool
      //   .query(`SELECT * FROM users WHERE id = $1`, [id])
      .then((response) => {
        if (response.rows.length > 0) {
          return response.rows[0];
        } else {
          return null;
        }
      })
      .catch((err) => {
        console.log(err.message);
      })
  };


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return query(`INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *`,
      [user.name, user.email, user.password])
  // pool
  //   .query(
  //     `INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *`,
  //     [user.name, user.email, user.password]
  //   )
    .then((response) => {
      return response.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser
};
