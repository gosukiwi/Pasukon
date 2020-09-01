const Token = require('../lib/lexer/token')

let col = 1

module.exports = class Lexer {
  * lex (input) {
    while (input !== '') {
      if (input[0] === 'A') {
        input = input.substring(1)
        yield new Token({ name: 'A', match: 'A', col: col++, line: 1 })
      } else if (input[0] === 'B') {
        input = input.substring(1)
        yield new Token({ name: 'B', match: 'B', col: col++, line: 1 })
      } else if (input[0] === 'C') {
        input = input.substring(1)
        yield new Token({ name: 'C', match: 'C', col: col++, line: 1 })
      } else {
        throw new Error(`Invalid token: ${input[0]}`)
      }
    }

    yield new Token({ name: 'EOF' })
  }
}
