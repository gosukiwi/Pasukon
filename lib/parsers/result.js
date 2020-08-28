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

  static ok (remaining, matched) {
    return new Result({ success: true, remaining, matched })
  }

  static fail (remaining, rule) {
    if (rule && (mostAdvancedFailure === null || mostAdvancedFailure.remaining.length > remaining.length)) { // record failure
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
