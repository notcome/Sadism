function QuizHistory (prefix, levelClient) {
  this.prefix = prefix;
  this.client = levelClient;
}

QuizHistory.prototype = {
  add: function (username, word, callback) {
    //A bug was revealed in the test:
    //if two record comes in the same millisecond, the later will override the former.
    //However, it will never happen in the real word.
    //We could also put some request limits in the HTTP layer.
    var time = new Date().getTime();
    this.client.put([this.prefix, username, time].join('.'), word, callback);
  },

  view: function (username, from, to, callback) {
    var prefix = this.prefix, history = [],
         start = [prefix, username, from].join('.'),
           end = [prefix, username, to].join('.');
    callback ? 0 : callback = function (err) { if (err) throw err; };

    this.client.createReadStream({start: start, end: end})
      .on('data', function (data) {
        var length = [prefix, username].join('.').length + 1;
        history.push({time: parseInt(data.key.substr(length)), value: data.value});
      })
      .on('error', function (err) {
        callback(err);
      })
      .on('end', function () {
        callback(null, history);
      });
  }
};

exports.init = function (prefix, levelClient) {
  return new QuizHistory(prefix, levelClient);
};
