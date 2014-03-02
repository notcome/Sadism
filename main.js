var http = require('http');
var url = require('url');
var qs = require('querystring');
var quizMod = require('./quiz-redis');
var termMod = require('./term-level');
require('./date-format');

var handler = {
  '/next': function (query, request, response) {
    var username = query.username;
    quizMod.getAQuiz(username, function (err, wordTimeComb) {
      if (err) writeResponse(200, 'none', response);
      else writeResponse(200, wordTimeComb, response);
    });
  },

  '/get': function (query, request, response) {
    var username = query.username, word = query.word;
    termMod.getItem(username, word, function (err, data) {
      if (err) writeResponse(200, 'none', response);
      else writeResponse(200, data, response);
    });
  },

  '/new': function (query, request, response, postData) {
    var username = query.username;
    var term = JSON.parse(postData);
    term.star = 1;
    termMod.newItem(username, term, function (err) {
      if (err) writeResponse(200, err, response);
      else writeResponse(200, 'OK', response);
    });
  },

  '/update': function (query, request, response, postData) {
    var username = query.username;
    var term = JSON.parse(postData);
    termMod.updateItem(username, term, function (err) {
      if (err) writeResponse(200, err, response);
      else writeResponse(200, 'OK', response);
    });
  }
};

var htmlErrorCode = {
  404: '404: Not Found',
  500: '500: Internal Server Error'
};

function writeResponse (code, data, response, type) {
  if (type == null) type = 'text/plain';
  response.writeHead(code, { 'Content-Type': type });
  if (typeof data == 'object') data = JSON.stringify(data);
  response.write('' + data);
  response.end();
}

function errorResponse (code, err, response) {
  writeResponse(code, htmlErrorCode[code], response);
  console.log(err);
}

function onRequest (request, response) {
  var pathname = url.parse(request.url).pathname;
  var query = querystring.parse(url.parse(request.url).query);
  var postData = '';

  request.addListener('data', function (postDataChunk) {
    postData += postDataChunk;
  });
  request.addListener('end', function () {
    if (typeof handler[pathname] == 'function')
      handler[pathname](query, request, response, postData);
    else errorResponse(404, pathname + 'not found', response);
  });
}

var redisDB = require('redis').createClient();
var levelDB = require('levelup')('./sadism.level.db');

function init () {
  quizMod.init(redisDB);
  termMod.init(levelDB, function (username, object) {
    var star = object.star, word = object.word;
    var sec = 1000, min = 60 * sec, hour = 60 * min, day = 24 * hour;
    var ranks = [5 * min, 15 * min, 1 * hour, 3 * hour, 12 * hour, 2 * day, 4 * day, 8 * day, 16 * day, 32 * day];
    function RandomInt () { return parseInt((Math.random() + '').substr(3)); }
    var basicInterval = ranks[star % ranks.length];
    var time = new Date().getTime() + basicInterval + RandomInt() % basicInterval;
    if (star < ranks.length) 
      quizMod.addAQuiz(username, time.Format('yyyy-MM-dd'), time, word);
  });
  http.createServer(onRequest).listen(8888);
}