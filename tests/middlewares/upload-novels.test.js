const { fileFilter, MAX_FILES, MAX_FILE_SIZE } = require("../../src/middlewares/upload-novels");

describe("novel upload limits", () => {
  it("caps uploads at 10 text files of at most 5 MB each", () => {
    expect(MAX_FILES).toBe(10);
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });

  it.each(["novel.txt", "novel.md", "novel.markdown"])(
    "accepts supported text extension %s regardless of client-provided MIME type",
    (originalname) => {
      const callback = jest.fn();
      fileFilter({}, { originalname, mimetype: "application/octet-stream" }, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    }
  );

  it("rejects files outside the .txt allow-list", () => {
    const callback = jest.fn();
    fileFilter({}, { originalname: "novel.pdf", mimetype: "text/plain" }, callback);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Only .txt, .md, and .markdown files are allowed",
        status: 415,
      })
    );
  });
});
