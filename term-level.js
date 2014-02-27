var db;
var termPrefix = 'net.notcome.sadism.wordset';

function glue (s1, s2, s3) { return s3 ? [s1, s2, s3].join('.') : s1 + '.' + s2; }

function putTerm (username, object, callback) {
  db.put(glue(termPrefix, username, object.word), JSON.stringify(object), callback);
}

exports.updateTerm = putTerm;

exports.newItem = function (username, object, callback) {
  db.get(glue(termPrefixm, username, object.word), function (err) {
    if (err) {
      if (err.notFound) putTerm(username, object, callback);
      else callback(err);
    }
    else callback({ code: 'WWORDEXIST', info: object.word });
  });
}

exports.getItem = function (username, word, callback) {
  db.get(glue(termPrefix, username, word), function (err, data) {
    if (err) callback(err);
    else {
      callback(null, JSON.parse(data));
    }
  });
}

exports.delItem = function (username, word, callback) {
  db.del(glue(termPrefix, username, word), function (err, data) {
    if (err) callback(err);
    else {
      callback(null, JSON.parse(data));
    }
  });
}

exports.init = function (levelDB) { db = levelDB; }
