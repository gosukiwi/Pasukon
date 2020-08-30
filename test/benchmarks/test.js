const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

suite
  .add('one', function () {
    (new Function('a', 'b', 'return a + b'))(1, 1)
  })
  .add('len', function () {
    (function (a, b) { return a + b })(1, 1)
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
