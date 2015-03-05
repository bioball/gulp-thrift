_ = require 'lodash'


createArgs = (options) ->

  thriftOpts =
    version: false
    I: []
    nowarn: false
    strict: false
    verbose: false
    recurse: false
    allowNegKeys: false
    allow64bitConsts: false
    gen: ''
    out: false

  _.extend(thriftOpts, _.pick(options, Object.keys(thriftOpts)))

  _.reduce thriftOpts, (str, value, key) ->
    if value
      str += getFlag(key, value)
    str
  , ""

getFlag = (key, value) ->
  flagMap =
    "allowNegKeys": -> "--allow-neg-keys #{ value } "
    "allow64BitConsts": -> "--allow-64bit-consts #{ value } "
    "gen": -> "--gen #{ value } "
    "I": -> 
      _.reduce value, (string, dir) ->
        string += "-I #{ dir } "
      , ""
  
  if flagMap[key]
    flagMap[key]()
  else
    if _.isBoolean(value)
      "-#{ key } "
    else
      "-#{ key } #{ value } "

module.exports = createArgs