var events = require('events');
var util = require('util');

function WordSet (prefix, levelClient) {
  events.EventEmitter.call(this);
  this.prefix = prefix;
  this.client = levelClient;
}

function inherits (sub, sup, proto) {
  util.inherits(sub, sup);
  if (typeof proto !== 'undefined') {
    Object.keys(proto).forEach(function (key) {
      sub.prototype[key] = proto[key];
    });
  }
}

inherits(WordSet, events.EventEmitter, {
  add: function (username, word, notes, callback) {
    callback ? 0 : callback = function (err) { if (err) throw err; };
    var self = this;
    self.exists(username, word, function (err, exist) {
      if (err) callback(err);
      else if (exist) callback('Word has existed');
      else self._update(username, word, notes, 'add', callback);
    });
  },

  exists: function (username, word, callback) {
    this.client.exists([this.prefix, username, word].join('.'), callback);
  },

  get: function (username, word, callback) {
    callback ? 0 : callback = function (err) { if (err) throw err; };
    this.exists(username, word, function (err, data) {
      if (err) callback(err);
      else if (data) {
        data = JSON.parse(data);
        callback(null, data);
      }
      else callback('Word doesn\'t exist');
    })
  },

  remove: function (username, word, callback) {
    this.client.del([this.prefix, username, word].join('.'), callback);
  },

  _update: function (username, word, notes, eventName, callback) {
    callback ? 0 : callback = function (err) { if (err) throw err; };
    var self = this;
    this.client.put([this.prefix, username, word].join('.'), 
      JSON.stringify(notes), function (err, res) {
      if (err) callback(err);
      else {
        self.emit(eventName, username, word);
        callback();
      }
    });
  },

  update: function (username, word, notes, callback) {
    this._update(username, word, notes, 'update', callback);
  }
});

function installExists (level) {
  level.exists = function (key, callback) {
    callback ? 0 : callback = function (err) { if (err) throw err; };
    this.get(key, function (err, data) {
      if (data) callback(null, data);
      else callback(null, false);
    });
  };
}

exports.init = function (prefix, levelClient) {
  installExists(levelClient);
  return new WordSet(prefix, levelClient);
}
