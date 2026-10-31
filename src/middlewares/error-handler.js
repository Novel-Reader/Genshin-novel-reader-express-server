const logger = require("../utils/logger");

function errorHandlerMiddleWare(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const requestedStatus = err.status || err.statusCode;
  const status =
    Number.isInteger(requestedStatus) &&
    requestedStatus >= 400 &&
    requestedStatus <= 599
      ? requestedStatus
      : 500;
  const isUnauthorized = status === 401;
  const message = isUnauthorized
    ? "Token is invalid"
    : status >= 500
    ? "Internal server error"
    : err.message || "Request failed";

  if (status >= 500) {
    logger.error(err);
  }

  if (req.originalUrl.startsWith("/api")) {
    return res.status(status).json({ error_message: message });
  }

  res.locals.message = message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(status).render("error", (renderError, html) => {
    if (renderError) {
      return res.status(status).type("text/plain").send(message);
    }
    return res.send(html);
  });
}

module.exports = errorHandlerMiddleWare;
