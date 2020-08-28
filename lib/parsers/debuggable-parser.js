let indentation = 0
const indentStep = 2

class ConsoleLogger {
  log (message) {
    console.log(message)
  }
}

module.exports = class DebuggableParser {
  constructor (parser, logger) {
    this.parser = parser
    this.logger = logger || new ConsoleLogger()
  }

  parse (tokens) {
    this.log(`${this.indentation}${this.parser}: START`)
    this.indent()
    const result = this.parser.parse(tokens)
    this.dedent()
    this.log(`${this.indentation}${this.parser}: ${result.succeeded ? 'OK' : 'FAIL'}`)
    return result
  }

  getParsers () {
    return this.parser.getParsers()
  }

  get cacheKey () {
    return this.parser.cacheKey
  }

  toString () {
    return this.parser.toString()
  }

  // private

  log (message) {
    this.logger.log(message)
  }

  indent () {
    indentation += indentStep
  }

  dedent () {
    indentation -= indentStep
  }

  get indentation () {
    return Array(indentation).fill(' ').join('')
  }
}
