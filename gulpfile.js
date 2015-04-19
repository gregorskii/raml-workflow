'use strict';

var gulp = require('gulp');
var raml = require('gulp-raml');
var gutil = require('gulp-util');
var chalk = require('chalk');
var browserSync = require('browser-sync').create();

var rename = require('gulp-rename');

var reload = browserSync.reload;

var RAML_API = './api/api.raml';
var RAML_BLOB = './api/**/*.{raml,yml}';

var API_DEST = './out/static/docs/api';
var API_HTML = 'index.html';

function handleError(err) {
  console.error(err.toString());
  this.emit('end');
}

gulp.task('rlint', function() {
  return gulp.src(RAML_BLOB)
    .pipe(raml())
    .pipe(raml.reporter(reporterWithExitStatus))
});

gulp.task('apidoc', ['rlint'], function() {
  return gulp.src(RAML_API)
    .pipe(raml2html())
    .on('error', handleError)
    .pipe(rename(API_HTML))
    .pipe(gulp.dest(API_DEST));
});

gulp.task('apijson', ['rlint'], function() {
  return gulp.src(RAML_API)
    .pipe(raml2html({type: 'json'}))
    .on('error', handleError)
    .pipe(gulp.dest(API_DEST));
});

gulp.task('apiyaml', ['rlint'], function() {
  return gulp.src(RAML_API)
    .pipe(raml2html({type: 'yaml'}))
    .on('error', handleError)
    .pipe(gulp.dest(API_DEST));
});

gulp.task('serve', ['apidoc'], function() {

  setTimeout(function() {
      gulp.start('browserSync');
  }, 1000);

  global.watch = true;
  gulp.watch(RAML_BLOB, ['apidoc']);
  gulp.watch('./out/static/docs/api/*.html', function() {
      browserSync.reload();
  });
});

gulp.task('browserSync', function(callback) {
  browserSync.init({
      server: {
          baseDir: "./out/static/docs/api"
      }
  });

  return callback;
});

var reporterWithExitStatus =  function (error, data, options) {
  options = options || {};
  var msg;
  var description = chalk.yellow(
    'Error ' + error.context + '.' +
    ((error.context_mark) ? ' line: ' + error.context_mark.line + ', col: ' + error.context_mark.column : '')
  );
  var result = [
    '',
    chalk.underline(error.problem_mark.name),
    description,
    [
      '',
      chalk.gray('line ' + error.problem_mark.line),
      chalk.gray('col ' + error.problem_mark.column),
      chalk.blue(error.message)
    ].join('  ')
  ];
  if(options.verbose) {
    result = result.concat([
      '',
      chalk.grey(error.problem_mark.buffer)
    ]);
  }

  msg = result.join('\n');

  console.log(msg + '\n');

  gutil.beep();

  if (!global.watch) {
    process.exit(1);
  }

};

function raml2html(options) {
  var path = require('path');
  var through = require('through2');
  var raml2html = require('raml2html');

  var simplifyMark = function(mark) {
    if (mark) mark.buffer = mark.buffer.split('\n', mark.line + 1)[mark.line].trim();
  }

  if (!options) options = {};
  switch (options.type) {
    case 'json':
      options.config = {template: function(obj) { return JSON.stringify(obj, null, 2); }};
      break;
    case 'yaml':
      var yaml = require('js-yaml');
      options.config = {template: function(obj) { return yaml.safeDump(obj, {skipInvalid: true}); }};
      break;
    default:
      options.type = 'html';
      if (!options.config) options.config = raml2html.getDefaultConfig(
          options.https, options.template, options.resourceTemplate, options.itemTemplate);
  }
  if (!options.extension) options.extension = '.' + options.type;

  var stream = through.obj(function(file, enc, done) {
    var fail = function(message) {
      done(new gutil.PluginError('raml2html', message));
    };
    if (file.isBuffer()) {
      var cwd = process.cwd();
      process.chdir(path.resolve(path.dirname(file.path)));
      raml2html.render(file.contents, options.config,
        function(output) {
          process.chdir(cwd);
          stream.push(new gutil.File({
            base: file.base,
            cwd: file.cwd,
            path: gutil.replaceExtension(file.path, options.extension),
            contents: new Buffer(output)
          }));
          done();
        },
        function(error) {
          process.chdir(cwd);
          simplifyMark(error.context_mark);
          simplifyMark(error.problem_mark);
          process.nextTick(function() {
            fail(JSON.stringify(error, null, 2));
          });
        });
    }
    else if (file.isStream()) fail('Streams are not supported: ' + file.inspect());
    else if (file.isNull()) fail('Input file is null: ' + file.inspect());
  });

  return stream;
}
