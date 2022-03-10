const EC = require("elliptic").ec;
const { sha256 } = require("./crypto");
// Create and initialize EC context
// (better do it once and reuse it)
const ec = new EC("secp256k1");

const verifySignature = (publicKey, message, signature) => {
  try{
    const key = ec.keyFromPublic(publicKey, "hex");
    return key.verify(sha256(message), signature);
  } catch(e) {
    return false
  }
  
  // console.log(signature);
  // console.log(signature.verify(sha256(message)), "what");
  // console.log(signature, "sign");
};
module.exports = { ec, verifySignature };
