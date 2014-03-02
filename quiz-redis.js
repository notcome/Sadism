var db;
var async = require('async');

function asyncCaller (fn, args) { 
  return function (callback) {
    args.push(callback);
    fn.apply(this, args);
  }
}

// net.notcome.sadism.quizzes.YYYY-MM-DD => the set for all users who have quizzes on that day.
// net.notcome.sadism.quizzes.YYYY-MM-DD.username => the sorted set for all quizzes which the given user has on that day, sorted by quiz time.
var quizPrefix = 'net.notcome.sadism.quizzes';

exports.addAQuiz = function (username, date, time, word, callback) {
  async.series([
    asyncCaller(addUserToQuizSet, [username, date]),
    asyncCaller(addQuizToQuizSet, [username, date, time, word])
    ], callback);
};

//Get the top quiz of the user's today quiz set.
//If the quiz set is empty, WNOQUIZ will be returned.
exports.getAQuiz = function (username, callback) {
  var quizSet = glue(quizPrefix, today(), username);
  db.zrange(quizSet, 0, 0, function (err, data) {
    if (err) callback(err);
    else if (data.length == 0) callback({ code: 'WNOQUIZ', info: username });
    else db.zscore(quizSet, data[0], function (err, time) {
      if (err) callback(err);
      else callback({ word: data[0], time: time });
    });
  });
};

//Delete the top quiz of the user's today quiz set.
//If the given word is not the top quiz, WQUIZANSWERED will be returned.
exports.answerAQuiz = function (username, word, callback) {
  exports.getAQuiz(username, function (err, topQuiz) {
    if (err) callback(err);
    else if (topQuiz != word) callback({ code: 'WQUIZANSWERED', info: word });
    else db.zrem(glue(quizPrefix, today(), username), word, callback);
  });
};

exports.init = function (redis) { db = redis; }

function today () {
  var d = new Date().Format('yyyy-MM-dd');
}

function glue (s1, s2, s3) { return s3 ? [s1, s2, s3].join('.') : s1 + '.' + s2; }

function addUserToQuizSet (username, date, callback) {
  db.sadd(glue(quizPrefix, date), username, callback);
}

function addQuizToQuizSet (username, date, time, word, callback) {
  db.zadd(glue(quizPrefix, date, username), time.getTime(), word, callback);
}