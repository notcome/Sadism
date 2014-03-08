var prefix = 'test';
var levelup = require('levelup');
var level = levelup('./mydb');
var redis = require('redis').createClient();

var quiz = require('./quiz').init(prefix, redis);
var history = require('./quiz-history').init(prefix, level);
var wordset = require('./word-set').init(prefix, level);
var quizstar = require('./quiz-star').init(quiz, wordset);


module.exports = {
  getWord: function (username, word, callback) {
    wordset.get(username, word, callback);
  },
  addWord: function (username, word, notes, callback) {
    wordset.add(username, word, notes, callback);
  },
  updateWord: function (username, word, notes, callback) {
    wordset.update(username, word, notes, callback);
  },
  removeWord: function (username, word, callback) {
    wordset.remove(username, word, callback);
  },

  getQuiz: function (username, callback) {
    quiz.get(username, callback);
  },
  submitQuizResult: function (username, word, result, callback) {
    quiz.get(username, function (err, res) {
      if (err) callback(err);
      else if (res != word) callback('Quiz out-of-date!');
      else wordset.get(username, word, function (err, notes) {
        if (err) callback(err);
        else {
          notes.star = quizstar.nextStar(notes.star, result);
          wordset.update(username, word, notes, callback);
          history.add(username, word);
        }
      });
    });
  },

  viewHistory: function (user, from, to, callback) {
    history.view(username, from, to, callback);
  },

  init: function () {
  }
};
