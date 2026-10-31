const http = require("http");
const { getTags } = require("../../src/utils/get-tags");

describe("getTags", () => {
  let server;
  let tagResponse;
  let originalPythonApiUrl;

  beforeEach((done) => {
    originalPythonApiUrl = process.env.PYTHON_API_URL;
    tagResponse = { tags: "芭芭拉,小说" };
    server = http.createServer((req, res) => {
      let body = "";
      req.setEncoding("utf8");
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        expect(req.url).toBe("/api/tags");
        expect(JSON.parse(body)).toEqual({ text: "novel text" });
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(tagResponse));
      });
    });
    server.listen(0, "127.0.0.1", () => {
      process.env.PYTHON_API_URL = `http://127.0.0.1:${server.address().port}`;
      done();
    });
  });

  afterEach((done) => {
    if (originalPythonApiUrl === undefined) delete process.env.PYTHON_API_URL;
    else process.env.PYTHON_API_URL = originalPythonApiUrl;
    server.close(done);
  });

  it("sends novel text to the tag API and returns generated tags", async () => {
    await expect(getTags("novel text")).resolves.toBe("芭芭拉,小说");
  });

  it("rejects non-success responses so the scheduler can retry", async () => {
    tagResponse = { error: "invalid text" };
    server.removeAllListeners("request");
    server.on("request", (req, res) => {
      res.statusCode = 400;
      res.end(JSON.stringify(tagResponse));
    });

    await expect(getTags("novel text")).rejects.toThrow("HTTP 400");
  });
});
