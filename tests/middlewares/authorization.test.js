jest.mock("../../src/utils/db-helper", () => jest.fn());
jest.mock("../../src/utils/logger", () => ({ error: jest.fn() }));

const DBHelper = require("../../src/utils/db-helper");
const {
  loadCurrentUser,
  requireAdmin,
  requireCommentOwnerOrAdmin,
  requireOwnUserOrAdmin,
  requireOwnUserIdOrAdmin,
} = require("../../src/middlewares/authorization");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
}

describe("authorization middleware", () => {
  beforeEach(() => DBHelper.mockReset());

  it("loads the authenticated user from the signed token identity", () => {
    DBHelper.mockImplementation((sql, callback) => callback(null, [{ id: 7, email: "reader@example.com", role: "user" }]));
    const req = { auth: { name: "reader@example.com" } };
    const res = createResponse();
    const next = jest.fn();

    loadCurrentUser(req, res, next);

    expect(DBHelper).toHaveBeenCalledWith(
      "SELECT id, email, role FROM user WHERE email = ?",
      expect.any(Function),
      ["reader@example.com"]
    );
    expect(req.currentUser).toEqual({ id: 7, email: "reader@example.com", role: "user" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("rejects non-admin users from administrator endpoints", () => {
    DBHelper.mockImplementation((sql, callback) => callback(null, [{ id: 7, email: "reader@example.com", role: "user" }]));
    const res = createResponse();
    const next = jest.fn();

    requireAdmin({ auth: { name: "reader@example.com" } }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows a user to modify only their own account", () => {
    DBHelper.mockImplementation((sql, callback) => callback(null, [{ id: 7, email: "reader@example.com", role: "user" }]));
    const res = createResponse();
    const next = jest.fn();

    requireOwnUserOrAdmin(
      { auth: { name: "reader@example.com" }, body: { email: "other@example.com" }, query: {} },
      res,
      next
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows a user to access only their own user-book records", () => {
    DBHelper.mockImplementation((sql, callback) => callback(null, [{ id: 7, email: "reader@example.com", role: "user" }]));
    const res = createResponse();
    const next = jest.fn();

    requireOwnUserIdOrAdmin(
      { auth: { name: "reader@example.com" }, body: { user_id: 8 }, query: {} },
      res,
      next
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows comment owners to edit their own comments", () => {
    DBHelper.mockImplementation((sql, callback) => {
      callback(null, sql.includes("SELECT id, email, role")
        ? [{ id: 7, email: "reader@example.com", role: "user" }]
        : [{ author: "reader@example.com" }]);
    });
    const res = createResponse();
    const next = jest.fn();

    requireCommentOwnerOrAdmin(
      { auth: { name: "reader@example.com" }, body: { comment_id: 12 }, query: {} },
      res,
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
