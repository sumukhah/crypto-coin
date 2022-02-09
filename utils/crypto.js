const crypto = require("crypto");

const sha256 = (...inputs) => {
  const hash = crypto.createHash("sha256");
  inputs.sort();
  const input = inputs.map((i) => JSON.stringify(i)).join(" ");
  hash.update(input);
  return hash.digest("hex");
};

module.exports = { sha256 };
