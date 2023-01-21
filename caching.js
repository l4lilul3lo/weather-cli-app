const { readFileSync, writeFileSync, existsSync } = require('fs');
const cacheDoesntExist = !existsSync('./cache.json');

function createCache() {
  writeFileSync('./cache.json', JSON.stringify({}));
}

function getCache() {
  const cacheBuffer = readFileSync('./cache.json');
  return JSON.parse(cacheBuffer);
}

function clearCache() {
  writeFileSync('./cache.json', JSON.stringify({}));
}

function isExpired(expiry) {
  const currentDate = new Date();
  return currentDate.getTime() > expiry;
}

function removeExpired() {
  const cache = getCache();
  const locations = Object.keys(cache);
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    const { expiry } = cache[location];
    if (isExpired(expiry)) {
      delete cache[location];
    }
  }
  writeFileSync('./cache.json', JSON.stringify(cache));
}

(() => {
  if (cacheDoesntExist) {
    createCache();
    return;
  }

  removeExpired();
})();

function tenMinutes() {
  const expirationDate = new Date();
  const currentMinutes = expirationDate.getMinutes();
  expirationDate.setMinutes(currentMinutes + 10);
  return expirationDate.getTime();
}

function readCache(location, units) {
  const cache = getCache();
  if (!cache?.[`${location},${units}`]) {
    return { isCached: false, data: null, expiry: null };
  } else {
    const { data, expiry } = cache[`${location},${units}`];
    return { isCached: true, data, expiry };
  }
}

function writeCache(location, units, data, customExpiry) {
  const cache = getCache();
  cache[`${location},${units}`] = { data, expiry: customExpiry ? customExpiry : tenMinutes() };
  writeFileSync('./cache.json', JSON.stringify(cache));
}

module.exports = { writeCache, readCache, clearCache };
