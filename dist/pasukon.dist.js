(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window['Pasukon'] = require('./pasukon')

},{"./pasukon":20}],2:[function(require,module,exports){
module.exports=[{"type":"LEXER","tokens":[{"type":"TOKEN_DEFINITION","name":"LEX_CLOSE","matcher":{"type":"TOKEN_MATCHER","match":"/lex"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"LEX_OPEN","matcher":{"type":"TOKEN_REGEX_MATCHER","regex":"^lex\\s+"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"MATCH","matcher":{"type":"TOKEN_REGEX_MATCHER","regex":"^match\\s+"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"IGNORE","matcher":{"type":"TOKEN_MATCHER","match":"ignore"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"COLON","matcher":{"type":"TOKEN_MATCHER","match":":"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"SEMICOLON","matcher":{"type":"TOKEN_MATCHER","match":";"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"PIPE_ARROW","matcher":{"type":"TOKEN_MATCHER","match":"|>"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"PIPE","matcher":{"type":"TOKEN_MATCHER","match":"|"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"POPEN","matcher":{"type":"TOKEN_MATCHER","match":"("},"action":"match"},{"type":"TOKEN_DEFINITION","name":"PCLOSE","matcher":{"type":"TOKEN_MATCHER","match":")"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"QUESTION_MARK","matcher":{"type":"TOKEN_MATCHER","match":"?"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"PLUS","matcher":{"type":"TOKEN_MATCHER","match":"+"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"TIMES","matcher":{"type":"TOKEN_MATCHER","match":"*"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"REGEX_MATCHER","matcher":{"type":"TOKEN_REGEX_MATCHER","regex":"^/[^/]*/"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"REGEX_MATCHER","matcher":{"type":"TOKEN_REGEX_MATCHER","regex":"^{[^}]*}"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"CODE","matcher":{"type":"TOKEN_REGEX_MATCHER","regex":"^'[^']*'"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"CODE","matcher":{"type":"TOKEN_REGEX_MATCHER","regex":"^\"[^\"]*\""},"action":"match"},{"type":"TOKEN_DEFINITION","name":"NAME","matcher":{"type":"TOKEN_REGEX_MATCHER","regex":"^[a-zA-Z][a-zA-Z0-9_-]*"},"action":"match"},{"type":"TOKEN_DEFINITION","name":"WHITESPACE","matcher":{"type":"TOKEN_REGEX_MATCHER","regex":"^\\s+"},"action":"ignore"}]},{"type":"RULE","name":"token-action","definitions":[{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"MATCH"},"code":"return $1.trim()"},{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"IGNORE"}}]},{"type":"RULE","name":"token-matcher","definitions":[{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"CODE"},"code":"return { type: \"TOKEN_MATCHER\", match: $1.substring(1, $1.length - 1) }"},{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"REGEX_MATCHER"},"code":"return { type: \"TOKEN_REGEX_MATCHER\", regex: $1.substring(1, $1.length - 1) }"}]},{"type":"RULE","name":"token-definition","definitions":[{"type":"BINARY_CALL","parser":"then","lhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"token-action"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"action"}}},"rhs":{"type":"BINARY_CALL","parser":"then","lhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"NAME"}},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"name"}}},"rhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"token-matcher"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"matcher"}}}},"code":"return { type: \"TOKEN_DEFINITION\", name: $.name, matcher: $.matcher, action: $.action }"}]},{"type":"RULE","name":"lexer","definitions":[{"type":"BINARY_CALL","parser":"then","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"LEX_OPEN"}},"rhs":{"type":"BINARY_CALL","parser":"then","lhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"UNARY_CALL","parser":"many0","arg":{"type":"RULE_CALL","name":"token-definition"}},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"tokens"}}},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"LEX_CLOSE"}}},"code":"return { type: \"LEXER\", tokens: $.tokens }"}]},{"type":"RULE","name":"parser-name","definitions":[{"type":"BINARY_CALL","parser":"then","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"POPEN"}},"rhs":{"type":"BINARY_CALL","parser":"then","lhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"rule-expression"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"expr"}}},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"PCLOSE"}}},"code":"return $.expr"},{"type":"BINARY_CALL","parser":"then","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"QUESTION_MARK"}},"rhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"parser-name"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"arg"}}},"code":"return { type: \"UNARY_CALL\", parser: \"opt\", arg: $.arg }"},{"type":"BINARY_CALL","parser":"then","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"PLUS"}},"rhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"parser-name"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"arg"}}},"code":"return { type: \"UNARY_CALL\", parser: \"many1\", arg: $.arg }"},{"type":"BINARY_CALL","parser":"then","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"TIMES"}},"rhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"parser-name"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"arg"}}},"code":"return { type: \"UNARY_CALL\", parser: \"many0\", arg: $.arg }"},{"type":"BINARY_CALL","parser":"then","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"COLON"}},"rhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"parser-name"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"arg"}}},"code":"return { type: \"UNARY_CALL\", parser: \"token\", arg: $.arg }"},{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"NAME"},"code":"return { type: \"RULE_CALL\", name: $1 }"}]},{"type":"RULE","name":"rule-expression","definitions":[{"type":"BINARY_CALL","parser":"then","lhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"parser-name"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"lhs"}}},"rhs":{"type":"BINARY_CALL","parser":"then","lhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"NAME"}},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"parser"}}},"rhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"rule-expression"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"rhs"}}}},"code":"return { type: \"BINARY_CALL\", parser: $.parser, lhs: $.lhs, rhs: $.rhs }"},{"type":"BINARY_CALL","parser":"then","lhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"NAME"}},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"name"}}},"rhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"rule-expression"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"arg"}}},"code":"return { type: \"UNARY_CALL\", parser: $.name, arg: $.arg }"},{"type":"RULE_CALL","name":"parser-name"}]},{"type":"RULE","name":"rule-eval","definitions":[{"type":"BINARY_CALL","parser":"then","lhs":{"type":"UNARY_CALL","parser":"opt","arg":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"PIPE_ARROW"}}},"rhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"CODE"}},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"code"}}},"code":"return $.code.substring(1, $.code.length - 1)"}]},{"type":"RULE","name":"rule-definition","definitions":[{"type":"BINARY_CALL","parser":"then","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"PIPE"}},"rhs":{"type":"BINARY_CALL","parser":"then","lhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"rule-expression"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"expr"}}},"rhs":{"type":"UNARY_CALL","parser":"opt","arg":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"rule-eval"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"code"}}}}},"code":"$.code ? $.expr.code = $.code : null; return $.expr"}]},{"type":"RULE","name":"rule","definitions":[{"type":"BINARY_CALL","parser":"then","lhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"NAME"}},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"name"}}},"rhs":{"type":"BINARY_CALL","parser":"then","lhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"UNARY_CALL","parser":"many1","arg":{"type":"RULE_CALL","name":"rule-definition"}},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"definitions"}}},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"SEMICOLON"}}},"code":"return { type: \"RULE\", name: $.name, definitions: $.definitions }"}]},{"type":"RULE","name":"rules","definitions":[{"type":"UNARY_CALL","parser":"many0","arg":{"type":"RULE_CALL","name":"rule"}}]},{"type":"RULE","name":"start","definitions":[{"type":"BINARY_CALL","parser":"then","lhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"lexer"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"lexer"}}},"rhs":{"type":"BINARY_CALL","parser":"as","lhs":{"type":"RULE_CALL","name":"rules"},"rhs":{"type":"UNARY_CALL","parser":"token","arg":{"type":"RULE_CALL","name":"rules"}}},"code":"return [$.lexer].concat($.rules)"},{"type":"RULE_CALL","name":"rules"}]}]
},{}],3:[function(require,module,exports){
const Token = require('./token')

const regexCache = {}

module.exports = class Lexer {
  constructor (definitions) {
    this.definitions = definitions
    this.position = { col: 1, line: 1 }
  }

  * lex (input) {
    while (input !== '') {
      const [token, remaining] = this.lexOne(input)
      if (token !== null) yield token
      if (input === remaining) throw new Error(`Invalid token '${input[0]}' at line ${this.position.line}, column ${this.position.col}`)
      input = remaining
    }

    yield new Token({ name: 'EOF', match: null, col: this.position.col, line: this.position.line })
  }

  // private

  lexOne (input) {
    for (let i = 0, len = this.definitions.length; i < len; i++) {
      const definition = this.definitions[i]
      const matcher = definition.matcher
      if (matcher.type === 'TOKEN_MATCHER') {
        const match = matcher.match
        if (input.substring(0, match.length) === match) {
          const token = definition.action === 'match'
            ? new Token({ name: definition.name, match: match, col: this.position.col, line: this.position.line })
            : null
          this.updatePosition(match)
          return [token, input.substring(match.length)]
        }
      } else if (matcher.type === 'TOKEN_REGEX_MATCHER') {
        const result = this.getRegex(definition).exec(input)
        if (result !== null && result.index === 0) {
          const token = definition.action === 'match'
            ? new Token({ name: definition.name, match: result[0], col: this.position.col, line: this.position.line })
            : null
          this.updatePosition(result[0])
          return [token, input.substring(result[0].length)]
        }
      }
    }

    return [null, input]
  }

  getRegex (definition) {
    const regex = definition.matcher.regex
    return regexCache[regex] || (regexCache[regex] = new RegExp(regex))
  }

  updatePosition (match) {
    for (let i = 0, len = match.length; i < len; i++) {
      if (match[i] === '\n') {
        this.position.line += 1
        this.position.col = 1
      } else {
        this.position.col += 1
      }
    }
  }
}

},{"./token":4}],4:[function(require,module,exports){
module.exports = class Token {
  constructor ({ name, match, line, col }) {
    this.name = name
    this.match = match
    this.line = line || 0
    this.col = col || 0
  }

  is (name) {
    return this.name === name
  }
}

},{}],5:[function(require,module,exports){
const Evaluator = require('../evaluator')

module.exports = class As {
  constructor (parsers, code, rule) {
    if (parsers[1].tokenName === undefined) throw new Error("AS combinator only works with a token as the RHS: '(my-parser as :somename)'")

    this.lhs = parsers[0]
    this.name = parsers[1].tokenName
    this.code = code
    this.rule = rule
    this._cacheKey = null
  }

  parse (tokens) {
    const result = this.lhs.parse(tokens).clone()
    result.matched = { name: this.name, value: result.matched }
    if (this.code) result.matched = Evaluator.eval(this.code, result.matched)
    return result
  }

  getParsers () {
    return [this.lhs]
  }

  toString () {
    return `[AS ${this.lhs} ${this.name}]`
  }
}

},{"../evaluator":13}],6:[function(require,module,exports){
const Result = require('../result')
const Evaluator = require('../evaluator')

// This combinator is used to wrap a code evaluation around a parser. It's meant
// for internal use, as it's pretty much useless in the grammar.
module.exports = class Identity {
  constructor (getParser, code, rule) {
    this.getParser = getParser
    this._parser = null
    this.code = code
    this.rule = rule
    this._cacheKey = null
  }

  parse (tokens) {
    const result = this.parser.parse(tokens)
    if (result.failed) return Result.fail(result.remaining, this.rule)

    if (this.code) result.matched = Evaluator.eval(this.code, result.matched)
    return result
  }

  getParsers () {
    return [this.parser]
  }

  get parser () {
    if (this._parser === null) this._parser = this.getParser()
    return this._parser
  }

  toString () {
    return `[CALL RULE ${this.parser}]`
  }
}

},{"../evaluator":13,"../result":17}],7:[function(require,module,exports){
const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Many0 {
  constructor (parser, code, rule) {
    this.parser = parser
    this.code = code
    this.rule = rule
    this._cacheKey = null
  }

  parse (tokens) {
    if (tokens.isEmpty()) return Result.ok(tokens)

    let remaining = tokens
    let matched = []
    while (!remaining.isEmpty()) {
      const result = this.parser.parse(remaining)
      if (result.matched !== null) matched = matched.concat(result.matched)

      if (result.failed) {
        return Result.ok(remaining, this.code ? Evaluator.eval(this.code, matched) : matched)
      }

      remaining = result.remaining
    }
  }

  getParsers () {
    return [this.parser]
  }

  toString () {
    return `[MANY0 ${this.parser}]`
  }
}

},{"../evaluator":13,"../result":17}],8:[function(require,module,exports){
const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Many1 {
  constructor (parser, code, rule) {
    this.parser = parser
    this.code = code
    this.rule = rule
    this._cacheKey = null
  }

  parse (tokens) {
    if (tokens.isEmpty()) return Result.fail(tokens, this.rule)

    let remaining = tokens
    let matched = []
    while (!remaining.isEmpty()) {
      const result = this.parser.parse(remaining)
      if (result.matched !== null) matched = matched.concat(result.matched)

      if (result.failed) {
        if (matched.length === 0) {
          return Result.fail(tokens, this.rule)
        } else {
          return Result.ok(remaining, this.code ? Evaluator.eval(this.code, matched) : matched)
        }
      }

      remaining = result.remaining
    }
  }

  getParsers () {
    return [this.parser]
  }

  toString () {
    return `[MANY1 ${this.parser}]`
  }
}

},{"../evaluator":13,"../result":17}],9:[function(require,module,exports){
const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Optional {
  constructor (parser, code, rule) {
    this.parser = parser
    this.code = code
    this.rule = rule
    this._cacheKey = null
  }

  parse (tokens) {
    const result = this.parser.parse(tokens)
    const matched = this.code ? Evaluator.eval(this.code, result.matched) : result.matched
    return Result.ok(result.remaining, matched)
  }

  getParsers () {
    return [this.parser]
  }

  toString () {
    return `[OPTIONAL ${this.parser}]`
  }
}

},{"../evaluator":13,"../result":17}],10:[function(require,module,exports){
const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Or {
  constructor (parsers, code, rule) {
    this.parsers = parsers
    this.code = code
    this.rule = rule
    this._cacheKey = null
  }

  parse (tokens) {
    for (let i = 0, len = this.parsers.length; i < len; i++) {
      const result = this.parsers[i].parse(tokens)
      if (result.succeeded) {
        if (this.code) {
          result.matched = Evaluator.eval(this.code, result.matched)
        }
        return result
      }
    }

    return Result.fail(tokens, this.rule)
  }

  getParsers () {
    return this.parsers
  }

  toString () {
    if (this.rule) return `<RULE: ${this.rule}>`
    return `[OR ${this.parsers.map((p) => p.toString()).join(' ')}]`
  }
}

},{"../evaluator":13,"../result":17}],11:[function(require,module,exports){
const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Then {
  constructor (parsers, code, rule) {
    this.lhs = parsers[0]
    this.rhs = parsers[1]
    this.code = code
    this.rule = rule
    this._cacheKey = null
  }

  parse (tokens) {
    const lhs = this.lhs.parse(tokens)
    if (lhs.failed) return lhs

    const rhs = this.rhs.parse(lhs.remaining)
    if (rhs.succeeded) {
      rhs.matched = this.code ? Evaluator.eval(this.code, lhs.matched, rhs.matched) : [lhs.matched, rhs.matched]
      return rhs
    }

    return Result.fail(tokens, this.rule)
  }

  getParsers () {
    return [this.lhs, this.rhs]
  }

  toString () {
    return `[THEN ${this.lhs} ${this.rhs}]`
  }
}

},{"../evaluator":13,"../result":17}],12:[function(require,module,exports){
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

  get tokenName () {
    return this.parser.tokenName
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

},{}],13:[function(require,module,exports){
let $ = {}

module.exports = {
  eval (code, a, b) {
    if (!code) return null

    // return (function ($1, $2) {
    //   const matches = [$1, $2].flat()
    //   for (let i = 0, len = matches.length; i < len; i++) {
    //     const matched = matches[i]
    //     if (matched && Object.prototype.hasOwnProperty.call(matched, 'name')) {
    //       eval(`var $${matched.name} = ${JSON.stringify(matched.value)};`)
    //     }
    //   }
    //
    //   return eval(code)
    // }(a, b))

    const params = {}
    const matches = [a, b].flat()
    for (let i = 0, len = matches.length; i < len; i++) {
      const matched = matches[i]
      if (matched && Object.prototype.hasOwnProperty.call(matched, 'name')) {
        params[matched.name] = matched.value
      }
    }

    return (new Function ('$1', '$2', '$', '$ctx', code))(a, b, params, $)
  },

  setContext (context) {
    $ = context
  }
}

},{}],14:[function(require,module,exports){
const Token = require('./token-parser')

module.exports = class LeftRecursionChecker {
  constructor (parsers) {
    this.parsers = parsers
  }

  check () {
    Object.keys(this.parsers).forEach((rule) => this.checkRuleForLeftRecursion(rule, rule, []))
  }

  // For each OR, it cannot start with `rule`
  // if it calls other rules, those rules also cannot start with `rule`
  checkRuleForLeftRecursion (rule, cannotStartWith, stack) {
    this.parsers[rule].getParsers().forEach((parser) => { // all rules start with an or parser, that has at least one parser inside
      const leftmost = this.leftmostFor(parser)
      if (leftmost instanceof Token) return // terminal, we're done

      stack.push(rule)
      if (leftmost.rule === cannotStartWith) throw new Error(`Left recursion found: ${stack.join(' -> ')} -> ${cannotStartWith}`)
      if (stack.includes(leftmost.rule)) return // already checked
      this.checkRuleForLeftRecursion(leftmost.rule, cannotStartWith, stack)
    })
  }

  leftmostFor (parser) {
    if (parser === undefined) throw new Error('Could not find leftmost parser')
    if (parser instanceof Token) return parser
    if (parser.rule !== undefined) return parser
    return this.leftmostFor(parser.getParsers()[0])
  }
}

},{"./token-parser":19}],15:[function(require,module,exports){
let _memo = {}
const memo = {
  set (key, value) {
    _memo[key] = value
    return value
  },

  get (key) {
    return _memo[key]
  },

  has (key) {
    return Object.prototype.hasOwnProperty.call(_memo, key)
  },

  clear () {
    _memo = {}
  }
}

module.exports = class MemoizableParser {
  constructor (parser, cacheKey) {
    this.parser = parser
    this.cacheKey = cacheKey
  }

  static clear () {
    memo.clear()
  }

  parse (tokens) {
    return this.getMemo(tokens) || this.setMemo(tokens, this.parser.parse(tokens))
  }

  getParsers () {
    return this.parser.getParsers()
  }

  toString () {
    return this.parser.toString()
  }

  get tokenName () {
    return this.parser.tokenName
  }

  // private

  hasMemo (tokens) {
    return memo.has(`${this.cacheKey}-${tokens.cacheKey}`)
  }

  getMemo (tokens) {
    return memo.get(`${this.cacheKey}-${tokens.cacheKey}`)
  }

  setMemo (tokens, value) {
    return memo.set(`${this.cacheKey}-${tokens.cacheKey}`, value)
  }
}

},{}],16:[function(require,module,exports){
const Lexer = require('../lexer/lexer')
const TokenList = require('./token-list')
const Token = require('./token-parser')
const Result = require('./result')
const Many0 = require('./combinators/many0')
const Many1 = require('./combinators/many1')
const Optional = require('./combinators/optional')
const Or = require('./combinators/or')
const Then = require('./combinators/then')
const Identity = require('./combinators/identity')
const As = require('./combinators/as')
const LeftRecursionChecker = require('./left-recursion-checker')
const MemoizableParser = require('./memoizable-parser')
const DebuggableParser = require('./debuggable-parser')

function hashCode (s) {
  for (var i = 0, h = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0
  }

  return h
}

const DEFAULT_OPTIONS = {
  start: null,
  cache: false,
  debug: false,
  logger: null,
  lexer: null
}

module.exports = class Parser {
  constructor (rules, options = {}) {
    this.combinators = {
      binary: {
        or: Or,
        then: Then,
        as: As
      },
      unary: {
        many0: Many0,
        many1: Many1,
        opt: Optional
      }
    }
    this.parsers = {}
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)

    this.lexer = this.options.lexer || this.buildLexer(rules[0])
    if (rules[0].type === 'LEXER') rules = rules.slice(1)

    const lastRule = this.buildRules(rules)
    this.start = this.options.start || lastRule
    if (this.start === null) throw new Error('No rules found')

    new LeftRecursionChecker(this.parsers).check()
  }

  parse (input) {
    if (this.options.cache) MemoizableParser.clear()
    Result.clear()

    const parser = this.parsers[this.start]
    if (!parser) throw new Error(`Could not find starting parser: '${this.start}'`)
    return parser.parse(new TokenList(this.lexer.lex(input)))
  }

  getMostAdvancedFailure () {
    return Result.getMostAdvancedFailure()
  }

  addBinaryCombinator (name, klass) {
    if (!/[a-zA-Z][a-zA-Z0-9_-]*/.test(name)) throw new Error('Invalid name. It must start with a letter and only contain a-z, A-Z, 0-9, - and _.')

    this.combinators.binary[name] = klass
    return this
  }

  addUnaryCombinator (name, klass) {
    if (!/[a-zA-Z][a-zA-Z0-9_-]*/.test(name)) throw new Error('Invalid name. It must start with a letter and only contain a-z, A-Z, 0-9, - and _.')

    this.combinators.unary[name] = klass
    return this
  }

  // private

  buildRules (rules) {
    let lastRule = null
    rules.forEach((rule) => {
      const parsers = rule.definitions.map((definition) => this.parserFor(rule.name, definition))
      this.parsers[rule.name] = this.decorate(new Or(parsers, undefined, rule.name), rule)
      lastRule = rule.name
    })

    return lastRule
  }

  parserFor (rule, definition) {
    let parser = null
    if (definition.type === 'UNARY_CALL') {
      parser = this.buildUnaryCall(rule, definition)
    } else if (definition.type === 'BINARY_CALL') {
      parser = this.buildBinaryCall(rule, definition)
    } else {
      parser = this.buildRuleCall(rule, definition)
    }

    return this.decorate(parser, definition)
  }

  buildRuleCall (rule, definition) {
    if (definition.name === 'token') throw new Error('Token can only be called as unary')

    const getParser = (function (parsers, name, rule) {
      return function () {
        const parser = parsers[name]
        if (parser === undefined) throw new Error(`Could not find parser '${name}' in rule '${rule}'`)
        return parser
      }
    }(this.parsers, definition.name, rule))

    return new Identity(getParser, definition.code)
  }

  buildBinaryCall (rule, definition) {
    if (definition.parser === 'token') throw new Error('Token can only be called as unary')

    const Combinator = this.combinators.binary[definition.parser]
    if (Combinator === undefined) throw new Error(`Could not find binary combinator: '${definition.parser}' in rule '${rule}'`)

    const lhs = this.parserFor(rule, definition.lhs)
    const rhs = this.parserFor(rule, definition.rhs)
    return new Combinator([lhs, rhs], definition.code)
  }

  buildUnaryCall (rule, definition) {
    if (definition.parser === 'token') {
      if (definition.arg.type !== 'RULE_CALL') throw new Error('Tokens cannot call other rules or combinators')
      return new Token(definition.arg.name, definition.code)
    }

    const Combinator = this.combinators.unary[definition.parser]
    if (Combinator === undefined) throw new Error(`Could not find unary combinator: '${definition.parser}' in rule '${rule}'`)

    return new Combinator(this.parserFor(rule, definition.arg), definition.code)
  }

  decorate (parser, definition) {
    let final = parser

    if (this.options.cache && !(parser instanceof Token)) {
      final = new MemoizableParser(final, hashCode(JSON.stringify(definition)))
    }

    if (this.options.debug) {
      final = new DebuggableParser(final, this.options.logger)
    }

    return final
  }

  buildLexer (definition) {
    if (definition === undefined || definition.type !== 'LEXER') throw new Error('Lexer was not defined in grammar. Define it or provide a custom lexer.')
    return new Lexer(definition.tokens)
  }
}

},{"../lexer/lexer":3,"./combinators/as":5,"./combinators/identity":6,"./combinators/many0":7,"./combinators/many1":8,"./combinators/optional":9,"./combinators/or":10,"./combinators/then":11,"./debuggable-parser":12,"./left-recursion-checker":14,"./memoizable-parser":15,"./result":17,"./token-list":18,"./token-parser":19}],17:[function(require,module,exports){
const TokenList = require('./token-list')

let mostAdvancedFailure = null

module.exports = class Result {
  constructor ({ success, remaining, matched }) {
    this.success = success
    this.remaining = remaining || new TokenList([])
    this.matched = matched || null
  }

  get failed () {
    return !this.success
  }

  get succeeded () {
    return this.success
  }

  clone () {
    return new Result({ success: this.success, remaining: this.remaining, matched: this.matched })
  }

  static ok (remaining, matched) {
    return new Result({ success: true, remaining, matched })
  }

  static fail (remaining, rule) {
    if (rule && (mostAdvancedFailure === null || mostAdvancedFailure.remaining.index < remaining.index)) { // record failure
      mostAdvancedFailure = { remaining, rule }
    }

    return new Result({ success: false, remaining })
  }

  static getMostAdvancedFailure () {
    return mostAdvancedFailure
  }

  static clear () {
    mostAdvancedFailure = null
  }
}

},{"./token-list":18}],18:[function(require,module,exports){
let objectIdCounter = 0

module.exports = class TokenList {
  constructor (tokens, index) {
    const next = tokens.next()
    this.tokens = tokens
    this.index = index || 0
    this.head = next.value
    this.isDone = next.done
    this._tail = null
    this.objectId = objectIdCounter++
  }

  peek (name) {
    return this.head.is(name)
  }

  isEmpty () {
    return this.done
  }

  get tail () {
    if (this._tail === null) this._tail = new TokenList(this.tokens, this.index + 1)
    return this._tail
  }

  get cacheKey () {
    return this.objectId
  }
}

},{}],19:[function(require,module,exports){
const Result = require('./result')
const Evaluator = require('./evaluator')

module.exports = class Token {
  constructor (tokenName, code) {
    this.tokenName = tokenName
    this.code = code
    this._cacheKey = null
  }

  parse (tokens) {
    if (tokens.peek(this.tokenName)) {
      return Result.ok(tokens.tail, this.code ? Evaluator.eval(this.code, tokens.head.match) : tokens.head.match)
    }

    return Result.fail(tokens)
  }

  getParsers () {
    return [this]
  }

  toString () {
    return `[TOKEN ${this.tokenName}]`
  }
}

},{"./evaluator":13,"./result":17}],20:[function(require,module,exports){
const Parser = require('./parsers/parser')
const selfparse = require('./self-parse')

module.exports = class Pasukon {
  constructor (grammar, options = {}) {
    const definitions = selfparse(grammar.toString())
    this.parser = new Parser(definitions, options)
  }

  parse (input) {
    if (!input) throw new Error('Input missing. Provide a string-able object.')

    const result = this.parser.parse(input.toString())
    if (result.succeeded) {
      if (result.remaining.isEmpty() || result.remaining.head.is('EOF')) return result.matched
      const { line, col } = result.remaining.head
      throw new Error(`Syntax error line ${line}, column ${col}. Expected EOF, found <TOKEN ${result.remaining.head.name}: ${result.remaining.head.match}>`)
    }

    const mostAdvancedFailure = this.parser.getMostAdvancedFailure()
    const { line, col } = mostAdvancedFailure.remaining.head
    throw new Error(`Syntax error line ${line}, column ${col}. Expected '${mostAdvancedFailure.rule}', found <TOKEN ${mostAdvancedFailure.remaining.head.name}: ${mostAdvancedFailure.remaining.head.match}>`)
  }
}

},{"./parsers/parser":16,"./self-parse":21}],21:[function(require,module,exports){
const ast = require('./grammar.json')
const Parser = require('./parsers/parser')

// Returns a parser that is already pre-loaded with the pasukon grammar. Used
// internally to match itself.
module.exports = function parse (input) {
  const parser = new Parser(ast)
  const result = parser.parse(input)

  if (result.succeeded) {
    if (result.remaining.isEmpty() || result.remaining.head.is('EOF')) return result.matched

    const { line, col } = result.remaining.head
    throw new Error(`Syntax error line ${line}, column ${col}. Expected EOF, found <TOKEN ${result.remaining.head.name}: ${result.remaining.head.match}>`)
  }

  const mostAdvancedFailure = parser.getMostAdvancedFailure()
  const { line, col } = mostAdvancedFailure.remaining.head
  throw new Error(`Syntax error line ${line}, column ${col}. Expected '${mostAdvancedFailure.rule}', found <TOKEN ${mostAdvancedFailure.remaining.head.name}: ${mostAdvancedFailure.remaining.head.match}>`)
}

},{"./grammar.json":2,"./parsers/parser":16}]},{},[1]);
