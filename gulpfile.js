/**
 * Dependencies
 */

var gulp = require('gulp');
var karma = require('karma').server;
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var bump = require('gulp-bump');
var git = require('gulp-git');
var filter = require('gulp-filter');
var tagVersion = require('gulp-tag-version');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var runSequence = require('run-sequence');
var livereload = require('gulp-livereload');
var autoprefixer = require('gulp-autoprefixer');
var path = require('path');

/**
 * Parse environment and command line options
 *
 * This allows us to pass additional options
 * to the individual gulp tasks
 */

// Detect environment
var env = process.env.NODE_ENV;

// Minimist options for parsing CLI arguments
var minimistOptions = {
  alias: {

    // -t, -type, --t, --type are all the same
    type: 't',

    // -m, -message, --m, --message are all the same
    message: 'm',

    // --debug
    debug: 'debug'
  }
};

// Parse CLI arguments
var argv = require('minimist')(process.argv.slice(2), minimistOptions);

/**
 * File patterns
 *
 * Centrally defined all file globbing patterns so they
 * can be updated easily and reused in the code.
 *
 * All patterns are stored as a key in ngxFiles to prevent
 * global namespace pollution.
 */

var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './public');

// Destination directory for build process
var outputDirectory = path.join(rootDirectory, './public');

// Bower directory
var bowerDirectory = path.join(rootDirectory, './bower_components');

// Define hash of files to process
var ngxFiles = {

  // File that contain version that needs to be bump
  toBump: [
    path.join(rootDirectory, 'package.json'),
    path.join(rootDirectory, 'bower.json')
  ],

  // Source JavaScript files to add to build
  sourceJavaScriptFiles: [

    // Make sure module files are handled first
    path.join(sourceDirectory, '/**/_build/**/*.module.js'),

    // Then add all JavaScript files
    path.join(sourceDirectory, '/**/_build/**/*.js'),

    // Ignore unit tests
    '!' + path.join(sourceDirectory, '/**/_build/**/*.spec.js'),

    // Ignore files starting with _
    '!' + path.join(sourceDirectory, '/**/_build/**/_*.spec.js')
  ],

  // Source LESS files to add to build
  sourceLessFiles: [

    // Grab all .less files
    path.join(sourceDirectory, '/**/_build/**/*.less'),

    // And ignore files starting with _
    '!' + path.join(sourceDirectory, '/**/_build/**/_*.less')
  ],

  // Files to copy without processing (e.g. vendor files)
  filesToCopy: [
    {
      src: [
        path.join(bowerDirectory, '/jquery/dist/jquery.js'),
        path.join(bowerDirectory, '/jquery/dist/jquery.min.js'),
        path.join(bowerDirectory, '/jquery/dist/jquery.min.map')
      ],
      dest: path.join(outputDirectory, '/vendor/jquery/')
    },
    {
      src: path.join(bowerDirectory, '/html5shiv/dist/**/*.*'),
      dest: path.join(outputDirectory, '/vendor/html5shiv/')
    },
    {
      src: [
        path.join(bowerDirectory, '/angular/angular.js'),
        path.join(bowerDirectory, '/angular/angular.min.js'),
        path.join(bowerDirectory, '/angular/angular.min.js.map'),
        path.join(bowerDirectory, '/angular/angular-csp.css')
      ],
      dest: path.join(outputDirectory, '/vendor/angular/')
    },
    {
      src: [
        path.join(bowerDirectory, '/angular-ui-router/release/angular-ui-router.js'),
        path.join(bowerDirectory, '/angular-ui-router/release/angular-ui-router.min.js')
      ],
      dest: path.join(outputDirectory, '/vendor/angular-ui-router/')
    },
    {
      src: [
        path.join(bowerDirectory, '/moment/min/moment.min.js')
      ],
      dest: path.join(outputDirectory, '/vendor/moment/')
    },
    {
      src: [
        path.join(bowerDirectory, '/angular-moment/angular-moment.js'),
        path.join(bowerDirectory, '/angular-moment/angular-moment.min.js'),
        path.join(bowerDirectory, '/angular-moment/angular-moment.min.js.map')
      ],
      dest: path.join(outputDirectory, '/vendor/angular-moment/')
    }
  ],

  // Files to watch and trigger live reload
  filesToWatchForLiveReload: [
    path.join(sourceDirectory, '/build/**/*'),
    path.join(sourceDirectory, '/**/*.md'),
    path.join(sourceDirectory, '/**/*.jade')
  ]

};

/**
 * Check if in debug mode
 *
 * @returns {boolean}
 */

function inDebugMode() {
  return argv.debug;
}

/**
 * Bump version in files to bump
 *
 * Can be called as:
 *
 * gulp bump --type major|minor|patch
 *
 * - bumps version in filesToBump
 * - adds filesToBump to git repo
 * - tags git repository with new version
 *
 * Is not called directly but implicitly via release task.
 */

gulp.task('bump', function () {

  return gulp.src(ngxFiles.toBump)

    .pipe(plumber())

    // Bump the version
    .pipe(bump({type: argv.type}))

    // Save
    .pipe(gulp.dest('./'))

});

/**
 * Release new version
 *
 * Can be called as:
 *
 * gulp release --type major|minor|patch
 *
 * - bumps version in filesToBump
 * - adds filesToBump to git repo
 * - tags git repository with new version
 */

gulp.task('release', ['bump'], function () {

  var pkg = require('./package.json');
  var currentVersion = pkg.version;

  // Use git.status to see if git version control is active
  return git.status(null, function (err, output) {

    // Return if it is not a git repo
    if (err) return;

    return gulp.src(ngxFiles.toBump)

      .pipe(plumber())

      // add files to staging area
      .pipe(git.add())

      // commit the changed version number
      .pipe(git.commit(argv.message || ('feat(ngx): release v' + currentVersion)))

      // grab one file to extract version from
      .pipe(filter(ngxFiles.toBump[0]))

      // tag it in the repository
      .pipe(tagVersion());

  });

});

/**
 * Validate source JavaScript
 */

gulp.task('jshint-src-js', function () {
  return gulp.src(ngxFiles.sourceJavaScriptFiles)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
});

/**
 * Run test once and exit
 */

gulp.task('test-src-js', function (done) {
  return karma.start({
    configFile: path.join(rootDirectory, '/karma-src.conf.js'),
    singleRun: true
  }, done);
});

/**
 * Build JavaScript library
 *
 * Searches all _build directories in the public directory
 * and concatenates all JavaScript files and concatenates them to:
 *
 * public/build/js/app.js
 * public/build/js/app.min.js
 *
 */

gulp.task('build-js', function () {

  return gulp.src(ngxFiles.sourceJavaScriptFiles)
    .pipe(plumber())
    .pipe(gulpif(inDebugMode, sourcemaps.init()))
    .pipe(concat('app.js'))
    .pipe(gulpif(inDebugMode, sourcemaps.write()))
    .pipe(gulp.dest(path.join(outputDirectory, '/build/js/')))
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest(path.join(outputDirectory, '/build/js/')))
});

/**
 * Build LESS files
 */

gulp.task('build-less', function () {
  return gulp.src(ngxFiles.sourceLessFiles)
    .pipe(plumber())
    .pipe(gulpif(inDebugMode, sourcemaps.init()))
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(concat('app.css'))
    .pipe(gulpif(inDebugMode, sourcemaps.write()))
    .pipe(gulp.dest(path.join(outputDirectory, '/build/css/')))
    .pipe(minifyCSS())
    .pipe(rename('app.min.css'))
    .pipe(gulp.dest(path.join(outputDirectory, '/build/css/')))
    .on('error', gutil.log);
});

/**
 * Copy files
 */

gulp.task('copy-files', function () {
  ngxFiles.filesToCopy.forEach(function (operation) {
    if (operation && operation.src && operation.dest) {
      gulp.src(operation.src)
        .pipe(plumber())
        .pipe(gulp.dest(operation.dest));
    }
  });
});

/**
 * Watch task
 */

gulp.task('watch-all', function () {

  // Watch JavaScript files
  gulp.watch(ngxFiles.sourceJavaScriptFiles, ['process-js']);

  // Watch LESS files
  gulp.watch(path.join(sourceDirectory, '/**/_build/**/*.less'), ['process-less']);
});

/**
 * Livereload task
 */

gulp.task('livereload-when-build-changes', function () {

  // Get livereload server
  //var server = livereload();

  // Tell the livereload server to start listening
  livereload.listen();

  // Convenience function for triggering reload
  function reload(file) {
    livereload.changed(file.path);
  }

  // Reload when build files change
  gulp
    .watch(ngxFiles.filesToWatchForLiveReload)
    .on('change', reload)
    .on('added', reload)
    .on('delete', reload);
});

/**
 * Task for different parts of the build process
 */

gulp.task('process-all', ['process-js', 'process-less', 'copy-files']);
gulp.task('process-less', ['build-less']);
gulp.task('process-copy', ['build-css']);
gulp.task('process-js', function (done) {
  runSequence('jshint-src-js', 'test-src-js', 'build-js', done)
});

/**
 * Default task
 */

gulp.task('default', function () {
  runSequence('process-all', 'watch')
});

/**
 * Watch task
 */

gulp.task('watch', ['watch-all', 'livereload-when-build-changes']);
