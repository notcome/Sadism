function Quiz (prefix, redisClient) {
  this.prefix = prefix;
  this.client = redisClient;
}

Quiz.prototype = {
  get: function (username, callback) {
    this.client.zrange([this.prefix, username].join('.'), 0, 1, function (err, res) {
      if (err) callback(err);
      else if (res.length == 0) callback('Empty quiz set.');
      else callback(err, res[0]);
    });
  },

  update: function (username, word, time, callback) {
    if (time == 0) this.remove(username, word, callback);
    //Add a quiz or update a quiz
    this.client.zadd([this.prefix, username].join('.'), time, word, callback);
  },

  remove: function (username, word, callback) {
    this.client.zrem([this.prefix, username].join('.'), word, callback);
  }
};

exports.init = function (prefix, redisClient) {
  return new Quiz(prefix, redisClient);
};