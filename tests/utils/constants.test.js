describe("constants", () => {
  it("uses the default signing key when JWT_SECRET is not configured", () => {
    const jwtSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    try {
      jest.isolateModules(() => {
        const { SIGN_KEY } = require("../../src/utils/constants");
        expect(SIGN_KEY).toBe("sign_key_novel_reader_xhykjyxgs");
      });
    } finally {
      if (jwtSecret === undefined) {
        delete process.env.JWT_SECRET;
      } else {
        process.env.JWT_SECRET = jwtSecret;
      }
    }
  });

});
