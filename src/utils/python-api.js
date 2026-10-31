const http = require("http");
const https = require("https");
const LOCAL_CONFIG = require("../config/config-local.json");
const CONFIG = require("../config/config.json");
const logger = require("./logger");

const config = LOCAL_CONFIG || CONFIG;
const REQUEST_TIMEOUT_MS = 30000;

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const baseUrl = process.env.PYTHON_API_URL || config.pythonApiUrl || "http://127.0.0.1:5000";
    const url = new URL(path, baseUrl);
    const transport = url.protocol === "https:" ? https : http;
    const body = JSON.stringify(payload);
    const request = transport.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: REQUEST_TIMEOUT_MS,
      },
      (response) => {
        let responseBody = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          responseBody += chunk;
        });
        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`Python API returned HTTP ${response.statusCode}`));
            return;
          }

          try {
            resolve(JSON.parse(responseBody));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("timeout", () => request.destroy(new Error("Python API request timed out")));
    request.on("error", (error) => {
      logger.error("Python API request failed:", error);
      reject(error);
    });
    request.end(body);
  });
}

module.exports = { postJson };
