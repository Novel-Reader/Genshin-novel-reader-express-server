const { isValidBookId } = require("../../src/utils/validation");

describe("isValidBookId", () => {
  it.each([1, "1", "42"])("accepts positive integer id %s", (bookId) => {
    expect(isValidBookId(bookId)).toBe(true);
  });

  it.each([undefined, null, "", "0", 0, -1, "1.5", "1abc", " 1"])(
    "rejects invalid book id %s",
    (bookId) => {
      expect(isValidBookId(bookId)).toBe(false);
    }
  );
});
