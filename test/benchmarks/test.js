const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

suite
  .add('one', function () {
    'some kind of long string but not so long'.charCodeAt(0) === 's'.charCodeAt(0)
  })
  .add('two', function () {
    'some kind of long string but not so long'.charCodeAt(0) === 115
  })
  .add('three', function () {
    'some kind of long string but not so long'[0] === 's'
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
