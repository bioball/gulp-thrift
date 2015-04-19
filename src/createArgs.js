const _ = require('lodash');

/**
 * helper function that takes an object of options, and spits out a string of command line options that Thrift expects.
 * @param  {Object}   options
 * @return {String}
 */
const createArgs = function (options) {

  var thriftOpts = {
    version: false,
    I: [],
    nowarn: false,
    strict: false,
    verbose: false,
    recurse: false,
    allowNegKeys: false,
    allow64bitConsts: false,
    gen: '',
    out: false
  };

  // extend any properties that belong to thrift command line options.
  _.extend(thriftOpts, _.pick(options, Object.keys(thriftOpts)));

  return _.reduce(thriftOpts, function(str, value, key) {
    if (value) {
      str += getFlag(key, value);
    }
    return str;
  }, "");
};

const getFlag = function(key, value) {
  const flagMap = {
    allowNegKeys: function(){ return "--allow-neg-keys " + value + " "; },
    allow64BitConsts: function(){ return "--allow-64bit-consts " + value + " "; },
    gen: function(){ return "--gen " + value + " "; },
    I: function(){
      return _.reduce(value, function(string, dir) {
        return string += "-I " + dir + " ";
      }, "");
    }
  };

  if (flagMap[key]) {
    return flagMap[key]();
  } else {
    if (_.isBoolean(value)) {
      return "-" + key + " ";
    } else {
      return "-" + key + " " + value + " ";
    }
  }
};

module.exports = createArgs;