const DBHelper = require("../utils/db-helper");
const logger = require("../utils/logger");

class ApiUser {

  static getUserInfo(req, res) {
    const email = req.query.email;
    const sql = `SELECT id, name, email, avatar, role FROM user WHERE email=?`;
    DBHelper(
      sql,
      (err, results) => {
        if (err) {
          logger.error(err);
          res.status(500).send({ error_message: "Unable to load user" });
          return;
        }
        res.status(200).send(results);
      },
      [email]
    );
  }

  static addUser(req, res) {
    const { email, name, password } = req.body;
    // verify user info must contain email, name and password
    if (
      typeof email !== "string" || !email.trim() || email.length > 255 ||
      typeof name !== "string" || !name.trim() || name.length > 255 ||
      typeof password !== "string" || !password
    ) {
      res.status(400).send({ error_massage: "Email, username or password is not correct" });
      return;
    }
    if (typeof password !== "string" || password.length < 8) {
      res.status(400).send({ error_message: "Password must be at least 8 characters" });
      return;
    }
    let sql = `SELECT * FROM user WHERE email=?`;
    DBHelper(
      sql,
      (err, results) => {
        // exec error
        if (err) {
          logger.error(err);
          res.status(500).send({ error_massage: "Internal server error" });
          return;
        }
        if (results.length > 0) {
          res.status(400).send({ error_massage: "This email is used" });
          return;
        }
        // If can not find email in db, insert new email into db
        sql = `insert into user (name, email, password, avatar) values(?, ?, ?, ?)`;
        DBHelper(
          sql,
          (err, results) => {
            if (err) {
              logger.error(err);
              res.status(500).send({ error_message: "Unable to create user" });
              return;
            }
            res.status(200).send("success");
          },
          [
            name,
            email,
            password,
            "https://www.baidu.com/img/flexible/logo/pc/result@2.png",
          ]
        );
      },
      [email]
    );
  }

  static deleteUser(req, res) {
    const email = req.query.email;
    if (typeof email !== "string" || !email.trim()) {
      res.status(400).send({ error_message: "A valid email is required" });
      return;
    }
    const sql = `DELETE FROM user WHERE email=?`;
    DBHelper(
      sql,
      (err, results) => {
        if (err) {
          logger.error(err);
          res.status(500).send({ error_message: "Unable to delete user" });
          return;
        }
        logger.info(results);
        res.status(200).send("success");
      },
      [email]
    );
  }

  static changeUserPassword(req, res) {
    const { email, password } = req.body;
    if (typeof email !== "string" || !email.trim()) {
      res.status(400).send({ error_message: "A valid email is required" });
      return;
    }
    if (typeof password !== "string" || password.length < 8) {
      res.status(400).send({ error_message: "Password must be at least 8 characters" });
      return;
    }
    const sql = `update user set password = ? where email = ?`;
    DBHelper(
      sql,
      (err, results) => {
        if (err) {
          logger.error(err);
          res.status(500).send({ error_message: "Unable to update password" });
          return;
        }
        res.status(200).send("success");
      },
      [password, email]
    );
  }

  static changeUserAvatar(req, res) {
    const { email, avatar } = req.body;
    if (typeof email !== "string" || !email.trim()) {
      res.status(400).send({ error_message: "A valid email is required" });
      return;
    }
    if (typeof avatar !== "string" || !avatar.trim() || avatar.length > 255) {
      res.status(400).send({ error_message: "A valid avatar is required" });
      return;
    }
    const sql = `update user set avatar = ? where email = ?`;
    DBHelper(
      sql,
      (err, results) => {
        if (err) {
          logger.error(err);
          res.status(500).send({ error_message: "Unable to update avatar" });
          return;
        }
        res.status(200).send("success");
      },
      [avatar, email]
    );
  }
}

module.exports = ApiUser;
