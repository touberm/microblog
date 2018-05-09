'use strict';

const crypto = require('crypto');

module.exports = (str)=>{
  let hash = crypto.createHash('md5');
  let md5 = hash.update(str).digest('base64');
  return md5;
}