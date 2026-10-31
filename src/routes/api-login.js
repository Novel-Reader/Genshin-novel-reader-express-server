const DBHelper = require("../utils/db-helper");
const logger = require("../utils/logger");
const { setToken } = require("../utils/token");
const {
  hashPassword,
  isPasswordHash,
  verifyPassword,
} = require("../utils/password");

class ApiLogin {
  static login(req, res, next) {
    const { email, password } = req.body;
    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string"
    ) {
      res
        .status(400)
        .send({ error_message: "Email or password is not correct" });
      return;
    }
    const sql = `SELECT id, email, password FROM user WHERE email=?`;
    DBHelper(
      sql,
      async (err, results) => {
        if (err) {
          logger.error(err);
          res.status(500).send({ error_message: "Internal server error" });
          return;
        }
        let validPassword = false;
        try {
          if (results.length > 0) {
            validPassword = isPasswordHash(results[0].password)
              ? await verifyPassword(password, results[0].password)
              : results[0].password === password;
          }
        } catch (error) {
          logger.error(error);
          res.status(500).send({ error_message: "Internal server error" });
          return;
        }
        if (!validPassword) {
          res
            .status(400)
            .send({ error_message: "Email or password is not correct" });
          return;
        }

        const user = results[0];
        const sendToken = () =>
          setToken(user.email)
            .then((data) => res.status(200).json({ token: data }))
            .catch((error) => {
              logger.error(error);
              res.status(500).send({ error_message: "Internal server error" });
            });

        if (isPasswordHash(user.password)) {
          sendToken();
          return;
        }

        try {
          const passwordHash = await hashPassword(password);
          DBHelper(
            `UPDATE user SET password=? WHERE id=?`,
            (updateError) => {
              if (updateError) {
                logger.error(updateError);
                res
                  .status(500)
                  .send({ error_message: "Internal server error" });
                return;
              }
              sendToken();
            },
            [passwordHash, user.id]
          );
        } catch (error) {
          logger.error(error);
          res.status(500).send({ error_message: "Internal server error" });
        }
      },
      [email]
    );
  }
}

module.exports = ApiLogin;
