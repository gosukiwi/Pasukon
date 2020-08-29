module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      build: {
        src: 'lib/browser.js',
        dest: 'dist/pasukon.dist.js'
      }
    },
    'closure-compiler': {
      build: {
        files: {
          'dist/pasukon.dist.min.js': 'dist/pasukon.dist.js'
        },
        options: {
          compilation_level: 'ADVANCED'
        }
      }
    }
  })

  require('google-closure-compiler').grunt(grunt)
  grunt.loadNpmTasks('grunt-browserify')
  grunt.registerTask('default', ['browserify', 'closure-compiler'])
}
