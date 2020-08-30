// const selfparse = require('../self-parse')
const parser = require('../pegjs/grammar')
const fs = require('fs')

module.exports = class CLI {
  start (args) {
    const [inputfile, outputfile] = args
    if (!inputfile || inputfile === 'help') return console.log(this.showhelp())

    this.generate(inputfile, outputfile || `${inputfile}.js`)
  }

  // private

  generate (inputfile, outputfile) {
    const grammar = fs.readFileSync(inputfile).toString()
    let result = JSON.stringify(parser.parse(grammar))

    // Some ugly-ass regex transformation to transform the snippets inside
    // `"code": "..."` into actual functions
    const matches = result.matchAll(/"code":"((?:\\"|[^"])*?)"/g)
    const snippets = []
    for (const match of matches) {
      snippets.push(match[1].replace(/\\"/g, '"'))
    }
    const parts = result.split(/"code":"(?:\\"|[^"])*?"/)
    const newResult = []
    parts.forEach((part) => {
      newResult.push(part)
      if (snippets.length > 0) newResult.push(`"code":function($1,$2,$,$ctx){${snippets.shift()}}`)
    })
    result = newResult.join('')
    result = this.inlineRegexes(result) // Inline all regex token matches
    result = `module.exports = ${result}`

    fs.writeFileSync(outputfile, result)
  }

  inlineRegexes (result) {
    const matches = result.matchAll(/{"type":"TOKEN_REGEX_MATCHER","regex":"((?:\\"|[^"])*?)"}/g)
    const snippets = []
    for (const match of matches) {
      snippets.push(this.escapeStringForRegex(match[1]))
    }
    const parts = result.split(/{"type":"TOKEN_REGEX_MATCHER","regex":"(?:\\"|[^"])*?"}/)
    const stack = []
    parts.forEach((part) => {
      stack.push(part)
      if (snippets.length > 0) stack.push(`{"type":"TOKEN_REGEX_MATCHER","regex":/${snippets.shift()}/}`)
    })
    return stack.join('')
  }

  escapeStringForRegex (str) {
    return str.replace(/\//g, '\\/').replace(/\\\\/g, '\\')
  }

  showhelp () {
    return `
Usage:
  pasukon <grammar.pasukon> [output.js]
    `
  }
}
