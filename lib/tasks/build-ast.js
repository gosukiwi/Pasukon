const selfparse = require('../self-parse')
const fs = require('fs')
const path = require('path')
const grammarFile = process.argv[2]

if (grammarFile === undefined) throw new Error("Grammar file not specified. Usage: 'node build-ast.js my-grammar.pasukon my-input-file.txt'")

const grammar = fs.readFileSync(grammarFile).toString()
fs.writeFileSync(path.join(__dirname, '..', 'grammar.json'), JSON.stringify(selfparse(grammar)))
