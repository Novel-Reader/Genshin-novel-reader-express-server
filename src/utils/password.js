const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;
const HASH_PREFIX = "scrypt$";

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, KEY_LENGTH);
  return `${HASH_PREFIX}${salt}$${key.toString("hex")}`;
}

async function verifyPassword(password, encodedPassword) {
  if (
    typeof encodedPassword !== "string" ||
    !encodedPassword.startsWith(HASH_PREFIX)
  ) {
    return false;
  }

  const [, salt, encodedKey] = encodedPassword.split("$");
  if (!/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(encodedKey)) {
    return false;
  }

  const key = Buffer.from(encodedKey, "hex");
  const candidate = await scrypt(password, salt, key.length);
  return crypto.timingSafeEqual(candidate, key);
}

function isPasswordHash(password) {
  return typeof password === "string" && password.startsWith(HASH_PREFIX);
}

module.exports = { hashPassword, verifyPassword, isPasswordHash };
