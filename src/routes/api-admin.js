const DBHelper = require("../utils/db-helper");
const logger = require("../utils/logger");

class ApiAdmin {

  static getUsers(req, res) {
    const sql = `SELECT * FROM user order by id asc`;
    DBHelper(sql, (err, results) => {
      if (err) {
        logger.error(err);
        res.status(400).send({ error_massage: err });
        return;
      }
      res.status(200).send(results);
    });
  }

  static getBooks(req, res) {
    const sql = `SELECT id, name, author, price FROM book order by id asc`;
    DBHelper(sql, (err, results) => {
      if (err) {
        logger.error(err);
        res.status(400).send({ error_massage: err });
        return;
      }
      res.status(200).send(results);
    });
  }

  static getComments(req, res) {
    const sql = `SELECT * FROM comment order by id asc`;
    DBHelper(sql, (err, results) => {
      if (err) {
        logger.error(err);
        res.status(400).send({ error_massage: err });
        return;
      }
      res.status(200).send(results);
    });
  }

}

module.exports = ApiAdmin;
