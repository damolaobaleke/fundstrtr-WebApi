const jwt = require('jsonwebtoken');

module.exports = {
  signJWT: (data, time = '1d') => {
    const secret = process.env.FUNDSTRTR_JWT_SECRET;
    return jwt.sign(data, secret, { expiresIn: time });
  },

  verifyJWT: (token) => {
    const key = process.env.FUNDSTRTR_JWT_SECRET;
    const decode = jwt.verify(token, key, (err, decoded) => {
      if (err) {
        return err;
      }
      return decoded;
    });
    return decode;
  }
};
