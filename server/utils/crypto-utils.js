'use strict';

/**
 * Cryptographic utilities module
 * @module app/utils/crypto-utils
 */

module.exports = (crypto, jwt, keypair) => {
  function generateSalt() {
    return crypto.randomBytes(24).toString('hex');
  }

  function generateJWToken(payload, salt) {
    let token;
    token = jwt.encode(payload, salt, 'HS256'); // HS256, HS384, HS512, RS256.
    return { token: token, salt: salt };
  }

  function decryptJWToken(token, salt) {
    if (!token || !salt) return false;
    return jwt.decode(token, salt, 'HS256'); // HS256, HS384, HS512, RS256.
  }

  function encryptStringWithRsaPublicKey(input, publicKey) {
    const buffer = new Buffer(input);
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
  }

  function decryptStringWithRsaPrivateKey(input, privateKey) {
    const buffer = new Buffer(input, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString('utf8');
  }

  return {
    generateJWToken: (payload, salt) => generateJWToken(payload, salt),
    decryptJWToken: (token, salt) => decryptJWToken(token, salt),
    generateSalt: () => generateSalt(),
    generateKeypair: () => keypair(),
    encryptString: (input, publicKey) => encryptStringWithRsaPublicKey(input, publicKey),
    decryptString: (input, publicKey) => decryptStringWithRsaPrivateKey(input, publicKey),
  };
};
