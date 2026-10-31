function isValidBookId(bookId) {
  return /^\d+$/.test(String(bookId || "")) && Number(bookId) > 0;
}

module.exports = { isValidBookId };
