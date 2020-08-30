#!/usr/bin/env node

const CLI = require('../lib/cli/index.js')
const cli = new CLI()
cli.start(process.argv.slice(2))
