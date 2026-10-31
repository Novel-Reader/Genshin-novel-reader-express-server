jest.mock("../../src/utils/logger", () => ({ error: jest.fn() }));

const logger = require("../../src/utils/logger");
const errorHandler = require("../../src/middlewares/error-handler");

function createResponse() {
  return {
    headersSent: false,
    locals: {},
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    type: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    render: jest.fn(),
  };
}

describe("error handler middleware", () => {
  beforeEach(() => {
    logger.error.mockClear();
  });

  it("returns JSON for JWT authentication errors", () => {
    const req = { originalUrl: "/api/users", app: { get: () => "production" } };
    const res = createResponse();

    errorHandler(
      { status: 401, message: "UnauthorizedError" },
      req,
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error_message: "Token is invalid",
    });
    expect(res.render).not.toHaveBeenCalled();
  });

  it("returns a generic JSON response for server errors", () => {
    const req = { originalUrl: "/api/users", app: { get: () => "production" } };
    const res = createResponse();

    errorHandler(new Error("database details"), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error_message: "Internal server error",
    });
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it("sends a plain-text response when rendering the error page fails", () => {
    const req = {
      originalUrl: "/missing-page",
      app: { get: () => "production" },
    };
    const res = createResponse();
    res.render.mockImplementation((view, callback) =>
      callback(new Error("render failed"))
    );

    errorHandler({ status: 404, message: "Not Found" }, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.type).toHaveBeenCalledWith("text/plain");
    expect(res.send).toHaveBeenCalledWith("Not Found");
  });

  it("passes errors onward if the response has already started", () => {
    const req = { originalUrl: "/api/users", app: { get: () => "production" } };
    const res = createResponse();
    res.headersSent = true;
    const next = jest.fn();
    const error = new Error("response already started");

    errorHandler(error, req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});
