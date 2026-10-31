const {
  hashPassword,
  verifyPassword,
  isPasswordHash,
} = require("../../src/utils/password");

describe("password", () => {
  it("stores passwords as salted scrypt hashes", async () => {
    const firstHash = await hashPassword("correct horse battery staple");
    const secondHash = await hashPassword("correct horse battery staple");
    expect(firstHash).not.toBe("correct horse battery staple");
    expect(firstHash).not.toBe(secondHash);
    expect(isPasswordHash(firstHash)).toBe(true);
    await expect(
      verifyPassword("correct horse battery staple", firstHash)
    ).resolves.toBe(true);
  });

  it("rejects wrong passwords and legacy plaintext as hashes", async () => {
    const hash = await hashPassword("correct horse battery staple");
    await expect(verifyPassword("incorrect password", hash)).resolves.toBe(
      false
    );
    await expect(
      verifyPassword("correct horse battery staple", "legacy plaintext")
    ).resolves.toBe(false);
    expect(isPasswordHash("legacy plaintext")).toBe(false);
  });
});
