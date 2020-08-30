const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

suite
  .add('one', function () {
    return 2 + 2
  })
  .add('two', function () {
    return 2 + 2
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
