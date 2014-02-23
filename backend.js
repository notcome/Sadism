var redis = require("redis"), client = redis.createClient();

var wordset = 'net.notcome.sadism.words', prefix = wordset + '.';
var practices = 'net.notcome.sadism.practices';

var __itemExample = {
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
  var key = object.key, id = prefix + key;

  client.sismember(wordset, key, function (err, exists) {
    if (err) callback(err);
    else if (exists) callback({ type: 'WEXIST', info: key});
    else {
      object.star = 0;
      client.hmset(id, object, callback);
    }
  });
}

function updateItem (object, callback) {
  var id = prefix + object.key;
  client.hmset(id, object, callback);
}

function getItem (key, callback) {
  var id = prefix + key;
  client.hgetall(id, callback);
}

function deleteItem (key) {
  
}

function addPractice(object, callback) {
  var sec = 1000, min = 60 * sec, hour = 60 * min, day = 24 * hour;
  var ranks = [15 * min, 1 * hour, 3 * hour, 12 * hour,
               2 * day, 4 * day, 8 * day, 16 * day];
  var time = (new Date()).getTime() + ranks[object.star];
  client.zadd(practices, time, key, callback);
}
