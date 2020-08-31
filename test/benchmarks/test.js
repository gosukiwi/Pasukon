const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

const $ = {
  code: 'asda asdasdasdasd',
  expr: {}
}

suite
  .add('one', function () {
    if ($.code) { $.expr.code = $.code }; return $.expr
  })
  .add('two', function () {
    $.code ? $.expr.code = $.code : null; return $.expr
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
