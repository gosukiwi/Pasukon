const Pasukon = require('../../lib/pasukon')
const fs = require('fs')
const path = require('path')

const parser = new Pasukon(fs.readFileSync(path.join(__dirname, 'grammar.g')))
console.log(parser.parse(`
Hi
`.trim()))
