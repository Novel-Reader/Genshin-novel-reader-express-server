const logger = require("../utils/logger");

const monitorMiddleware = (req, res, next) => {
  const { method, path: url } = req;

  req.on("end", () => {
    logger.info(`REQUEST: [${method}] ${url}`);
  });

  const send = res.send;
  res.send = (...args) => {
    const result = send.apply(res, args);
    const statusCode = res.statusCode;
    res.on("finish", () => {
      logger.info(`RESPONSE: [${method}]: ${url} Status: ${statusCode}`);
    });
    return result;
  };

  next();
};

module.exports = monitorMiddleware;
