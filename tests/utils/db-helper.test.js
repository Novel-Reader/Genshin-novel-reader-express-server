jest.mock("mysql", () => ({
  createPool: jest.fn(() => ({
    query: jest.fn(),
  })),
}));

const DBHelper = require("../../src/utils/db-helper");
const mysql = require("mysql");

describe("DBHelper", () => {
  const pool = mysql.createPool.mock.results[0].value;

  beforeEach(() => {
    pool.query.mockReset();
  });

  it("passes queries without parameters to the pool", () => {
    const callback = jest.fn();

    DBHelper("SELECT 1", callback);

    expect(pool.query).toHaveBeenCalledWith("SELECT 1", callback);
  });

  it("passes queries with parameters to the pool", () => {
    const callback = jest.fn();

    DBHelper("SELECT ?", callback, [1]);

    expect(pool.query).toHaveBeenCalledWith("SELECT ?", [1], callback);
  });

  it("passes synchronous query errors to the callback", () => {
    const error = new Error("query failed");
    const callback = jest.fn();
    pool.query.mockImplementation(() => {
      throw error;
    });

    DBHelper("SELECT 1", callback);

    expect(callback).toHaveBeenCalledWith(error);
  });
});
