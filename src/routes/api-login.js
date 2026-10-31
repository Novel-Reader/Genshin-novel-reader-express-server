const DBHelper = require("../utils/db-helper");
const logger = require("../utils/logger");
const { setToken } = require("../utils/token");

class ApiLogin {
  static login(req, res, next) {
    const { email, password } = req.body;
    const sql = `SELECT * FROM user WHERE email=? and password=?`;
    DBHelper(
      sql,
      (err, results) => {
        if (err) {
          logger.error(err);
          res.status(500).send({ error_message: "Internal server error" });
          return;
        }
        if (results.length === 0) {
          res
            .status(400)
            .send({ error_massage: "Email or password is not correct" });
          return;
        }
        setToken(email).then((data) => {
          res.status(200).json({ token: data });
        });
      },
      [email, password]
    );
  }
}

module.exports = ApiLogin;
