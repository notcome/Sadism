var http = require('http');
var url = require('url');
var querystring = require("querystring");

var backend = require('./backend');

var errors = {
  404: '404: Not Found',
  500: '500: Internal Server Error'
};

function writeResponse (code, data, response, type) {
  if (type == null) type = 'text/plain';
  response.writeHead(code, { 'Content-Type': type });
  if (typeof data == 'object') data = JSON.stringify(data);
  response.write(data);
  response.end();
}

function returnError (code, err, response) {
  writeResponse(code, errors[code], response);
  console.log(err);
}

var handler = {

};

function getItem(query, response) {
  backend.getItem(query.key, function (err, data) {
    if (err) {
      var code = err.type == 'WNOTFOUND' ? 404 : 500;
      returnError(code, err, response);
    }
    else writeResponse(200, data, response);
  });
}

function nextPractice(query, response) {
  backend.getPractice(function (err, data) {
    if (err) returnError(500, err, response);
    else backend.getItem(data.key, function (err, item) {
      console.log(data);
      if (err) returnError(500, err, response);
      else {
        data.key = item;
        writeResponse(200, data, response);
      }
    })
  });
}

function submit (query, response) {
  try {
    backend.getPractice(function (err, data) {
      if (err) throw err;
      else if (query.word != data) writeResponse(200, 'out-of-date', response);
      else {
        backend.getStar(data, function (err, star) {
          var newStar;
          if (err) throw err;
          if (query.succeed == 'true') {
            if (star > 9) {
              var a = star - star % 9 + 2, b = star / 9;
              if (a > b) newStar = star / 9;
              else newStar = a;
            }
            else newStar = star + 1;
          }
          else {
            if (star > 9) newStar = star - star % 9;
            else newStar = star * 9;
          }
          backend.increaseStar(data, newStar - star, function (err) {
            if (err) throw err;
            else writeResponse(200, newStar % 9, response);
          })
        });
      }
    });
  } catch (err) {
    returnError(500, err, response);
  }
}

function start() {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var query = querystring.parse(url.parse(request.url).query);
    if (pathname == '/get-item') getItem(query, response);
    else if (pathname == '/next-practice') nextPractice(query, response);
    else if (pathname == '/submit') submit(query, response);
    else returnError(404, request.url, response);
  }

  http.createServer(onRequest).listen(8888);
  console.log("HTTP server has started.");
}

start();
