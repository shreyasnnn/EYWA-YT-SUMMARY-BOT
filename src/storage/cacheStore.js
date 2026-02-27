const cache = new Map();

function getCached(videoId) {
  return cache.get(videoId);
}

function setCached(videoId, data) {
  cache.set(videoId, data);
}

module.exports = { getCached, setCached };