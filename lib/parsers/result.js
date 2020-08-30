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
