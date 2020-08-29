const fs = require('fs')
const path = require('path')
const Benchmark = require('benchmark')
const Pasukon = require('../../lib/pasukon')
const pegjsParser = require('../../lib/pegjs/grammar.js')
const grammar = fs.readFileSync(path.join(__dirname, '..', '..', 'lib', 'grammar.pasukon')).toString()
const suite = new Benchmark.Suite()

const pasukon = new Pasukon(grammar, { cache: false })
const pasukonWithCache = new Pasukon(grammar, { cache: true })
// add tests
suite
  .add('Pasukon', function () {
    pasukon.parse(grammar)
  })
  .add('Pasukon (cache enabled)', function () {
    pasukonWithCache.parse(grammar)
  })
  .add('PEGjs', function () {
    pegjsParser.parse(grammar)
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
