createArgs = require '../src/createArgs'
{ expect } = require 'chai'

describe 'creating arguments', ->

  it 'is a thing', ->
    expect(createArgs).to.exist

  it 'returns a string', ->
    expect(createArgs()).to.be.a('string')

  it 'returns the correct args for I', ->
    opts =
      I: [
        "./"
        "../foo"
      ]
    expect(createArgs(opts)).to.equal("-I ./ -I ../foo ")

  it 'returns the correct args for gen', ->
    expect(createArgs(gen: 'js')).to.equal('--gen js ')
    expect(createArgs(gen: 'java')).to.equal('--gen java ')
    expect(createArgs(gen: 'objectivec')).to.equal('--gen objectivec ')

  it 'ignores options that arent supposed to exist', ->
    expect(createArgs(animal: 'cow')).to.equal('')
    expect(createArgs(baseball: 'bat')).to.equal('')