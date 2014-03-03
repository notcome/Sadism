Object.prototype.SortedObject = function () {
  var keys = [], sortedObj = {}, self = this;
  for (var key in self) {
    keys.push(key);
  }
  keys.sort().forEach(function (key) {
    if (key != 'SortedObject')
      sortedObj[key] = self[key];
  });
  return sortedObj;
}