module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      build: {
        src: 'lib/browser.js',
        dest: 'dist/pasukon.dist.js',
        options: {
          standalone: 'Pasukon'
        }
      }
    },
    terser: {
      build: {
        files: {
          'dist/pasukon.dist.min.js': 'dist/pasukon.dist.js'
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-terser')
  grunt.loadNpmTasks('grunt-browserify')
  grunt.registerTask('default', ['browserify', 'terser'])
}
