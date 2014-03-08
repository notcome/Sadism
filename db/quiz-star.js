var sec = 1000, min = 60 * sec, hour = 60 * min, day = 24 * hour;
var ranks = [5 * min, 15 * min, 1 * hour, 3 * hour, 12 * hour,
             2 * day, 4 * day, 8 * day, 16 * day];

function RandomInt () { return parseInt((Math.random()+'').substr(3)); }

function getNextTime (star) {
  if (star == ranks.length);
  var basicInterval = ranks[star % ranks.length];
  return (new Date().getTime() + basicInterval + RandomInt() % basicInterval).getTime();
}

exports.init = function (quiz, wordset) {
  wordset.on('add', function (username, word) {
    wordset.get(username, word, function (err, notes) {
      if (err) throw err;
      else {
        notes.star = 0;
        wordset.update(username, word, notes);
      }
    });
  });
  
  wordset.on('update', function (username, word) {
    wordset.get(username, word, function (err, notes) {
      if (err) throw err;
      else quiz.update(username, word, getNextTime(notes.star));
    });
  });
}

exports.nextStar = function (star, result) {
  if (result) return star + 1;
  if (star > 2) return 2;
  return 0;
}