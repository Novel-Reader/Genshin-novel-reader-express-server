const { postJson } = require("./python-api");

function getTags(text) {
  return postJson("/api/tags", { text }).then((payload) => {
    if (typeof payload.tags !== "string") {
      throw new Error("Tag API response does not contain tags");
    }
    return payload.tags;
  });
}

module.exports = { getTags };
