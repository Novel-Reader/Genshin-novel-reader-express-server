const { expressjwt } = require("express-jwt");
const { SIGN_KEY } = require("../utils/constants");

const verifyTokenExpiresMiddleWare = expressjwt({
  secret: SIGN_KEY,
  algorithms: ["HS256"],
});

module.exports = verifyTokenExpiresMiddleWare;
