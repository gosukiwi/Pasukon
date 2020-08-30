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
