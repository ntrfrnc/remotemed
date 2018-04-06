const lang = require('../config').lang;
let defaultTmap = require('../translations/en-US');
let tMap;

try {
  tMap = require('../translations/' + lang);
} catch (e) {
  console.log(e);
  tMap = defaultTmap;
}

module.exports = (token) => {
  const t = tMap[token];
  return (t !== void(0)) ? t : defaultTmap[token];
};