var http = require('http');
var url = require('url');
var qs = require('querystring');

require('./date-format');

function router (request, response) {
  var pathname = url.parse(request.url).pathname;
  var query = querystring.parse(url.parse(request.url).query);
}

function start() {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var query = querystring.parse(url.parse(request.url).query);
    if (pathname == '/get-item') getItem(query, response);
    else if (pathname == '/next') nextPractice(query, response);
    else if (pathname == '/submit') submit(query, response);
    else returnError(404, request.url, response);
  }

  http.createServer(onRequest).listen(8888);
  console.log("HTTP server has started.");
}

start();