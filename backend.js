var redis = require('redis'), client = redis.createClient();
var async = require('async');

var wordset = 'net.notcome.sadism.words', prefix = wordset + '.';
var practices = 'net.notcome.sadism.practices';

var sec = 1000, min = 60 * sec, hour = 60 * min, day = 24 * hour;
var ranks = [5* min, 15 * min, 1 * hour, 3 * hour, 12 * hour,
             2 * day, 4 * day, 8 * day, 16 * day];

var emFn = function () {}

function RandomInt () { return parseInt((Math.random()+'').substr(3)); }

var itemExample = {
  key: "carnival",
  value: "嘉年华",
  comments: {
    examples: [
      "The carnival was closed when Niko arrivied in the Liberty City.",
      "A bowling club was beside the carnival, the first five frames of which is free."
    ]
  }
};

function addItem (object, callback) {
  var key = object.key;
  if (!callback) callback = emFn;
  for (var item in object)
    if (typeof object[item] == 'object')
      object[item] = JSON.stringify(object[item]);

  async.series([
    function (callback) {
      client.sismember(wordset, key, function (err, exists) {
        err = err ? err : (exists ? { type: 'WEXIST', info: key} : null);
        callback(err);
      })
    },
    function (callback) { updateItem(object, callback); },
    function (callback) { client.sadd(wordset, key, callback); },
    function (callback) { increaseStar(key, callback); }
    ], callback);
}
exports.addItem = addItem;

function updateItem (object, callback) {
  var id = prefix + object.key;
  client.hmset(id, object, callback);
}
exports.updateItem = updateItem;

function getItem (key, callback) {
  var id = prefix + key;
  if (!callback) callback = emFn;
  client.hgetall(id, function (err, data) {
    if (data == null) err = { type: 'WNOTFOUND', info: key };
    if (err) { callback(err); return; }
    for (var item in data) {
      try {
        var str = data[item];
        var value = JSON.parse(str);
        data[item] = value;
      }
      catch (err) {
        data[item] = str;
      }
    }
    callback(null, data);
  });
}
exports.getItem = getItem;

function deleteItem (key, callback) {
  var id = prefix + key;
  async.series([
    function (callback) { client.srem(wordset, key, callback); },
    function (callback) { client.del(id, callback); }
    ], callback);
}
exports.deleteItem = deleteItem;

function getStar (key, callback) {
  var id = prefix + key;
  client.hget(id, 'star', function (err, data) {
    if (err == null && data == null) err = { type: 'WNOTFOUND', info: key };
    callback(err, data);
  });
}
exports.getStar = getStar;

function increaseStar (key, value, callback) {
  var id = prefix + key;
  if (typeof value == 'function') callback = value, value = null;
  if (!callback) callback = emFn;
  if (value == null) value = 1;

  client.hincrby(id, 'star', value, function (err, star) {
    if (err) callback(err);
    else addPractice(key, star, callback);
  });
}
exports.increaseStar = increaseStar;

function addPractice (key, star, callback) {
  var basicInterval = ranks[star % ranks.length];
  var time = new Date().getTime() + basicInterval + RandomInt() % basicInterval;
  client.zadd(practices, time, key, callback);
}
exports.addPractice = addPractice;

function getPractice (callback) {
  if (!callback) callback = emFn;
  function getTime (key, callback) {
    client.zscore(practices, key, function (err, score) {
      if (err) callback(err);
      else callback(null, { key: key, time: score });
    });
  }
  client.zrange(practices, 0, 0, function (err, data) {
    if (err) callback(err);
    else getTime(data[0], callback);
  });
}
exports.getPractice = getPractice;

client.on('ready', function () {
  console.log('Redis server connected.');
});
