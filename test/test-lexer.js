const Token = require('../lib/lexer/token')

module.exports = class Lexer {
  * lex (input) {
    while (input !== '') {
      if (input[0] === 'A') {
        input = input.substring(1)
        yield new Token({ name: 'A', match: 'A' })
      } else if (input[0] === 'B') {
        input = input.substring(1)
        yield new Token({ name: 'B', match: 'B' })
      } else if (input[0] === 'C') {
        input = input.substring(1)
        yield new Token({ name: 'C', match: 'C' })
      } else {
        throw new Error(`Invalid token: ${input[0]}`)
      }
    }

    yield new Token({ name: 'EOF' })
  }
}
