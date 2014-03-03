//All files in utils add some sugars to Javascript built-in library.

require('fs').readdirSync('./utils').forEach(function (file) {
  if (file.substr(-3) == '.js')
    require('./' + file);
});
