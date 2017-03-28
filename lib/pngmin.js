'use strict';

var os       = require('os'),
    fs       = require('fs'),
    path     = require('path'),
    through2 = require('through2'),
    pngquant = require('pngquant'),
    gutil    = require('gulp-util'),
    sprintf  = require('sprintf');

module.exports = function(options) {

  options = options || [256];
  
  return through2.obj(function(file, enc, cb) {

    if (!file.path.match(/\.png$/i)) {
      this.push(file)
      return cb();
    }

    var filepath = path.relative(process.cwd(), file.path);

    if (file.isNull()) {
      this.push(file)
      return cb();
    }

    if (file.isBuffer()) {

      var originalSize = file.contents.length;
      var tmpFilePath = path.resolve(os.tmpdir(), 'pngmin_' + (+new Date) + '_' + path.basename(file.path));

      var writeStream = fs.createWriteStream(tmpFilePath);
      //memStream = new MemoryStream;
      file.pipe(new pngquant(options)).pipe(writeStream);

      var self = this;
      writeStream.on('close', function() {

        var size = fs.statSync(tmpFilePath).size;

        if (originalSize > size) {

          var percent = sprintf('%.2f', 100 - Math.floor((size / originalSize) * 10000) * .01);

          gutil.log('pngquant:', gutil.colors.cyan(filepath), originalSize + 'bytes to ' + size + 'bytes (-' + percent + '%)');

          file.contents = fs.readFileSync(tmpFilePath);
        }

        fs.unlinkSync(tmpFilePath);

        self.push(file);
        return cb();
      });      
    }

    if (file.isStream()) {
      gutil.log('pngquant:', gutil.colors.cyan(filepath));
      file.contents = file.contents.pipe(new pngquant(options));
      this.push(file)
      return cb();
    }
  });
};
