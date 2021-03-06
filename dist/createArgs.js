'use strict';

var _ = require('lodash');

/**
 * helper function that takes an object of options, and spits out a string of command line options that Thrift expects.
 * @param  {Object}   options
 * @return {String}
 */
var createArgs = function createArgs(options) {

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

  return _.reduce(thriftOpts, function (str, value, key) {
    if (value) {
      str += getFlag(key, value);
    }
    return str;
  }, '');
};

var getFlag = function getFlag(key, value) {
  var flagMap = {
    allowNegKeys: function allowNegKeys() {
      return '--allow-neg-keys ' + value + ' ';
    },
    allow64BitConsts: function allow64BitConsts() {
      return '--allow-64bit-consts ' + value + ' ';
    },
    gen: function gen() {
      return '--gen ' + value + ' ';
    },
    I: function I() {
      return _.reduce(value, function (string, dir) {
        return string += '-I ' + dir + ' ';
      }, '');
    }
  };

  if (flagMap[key]) {
    return flagMap[key]();
  } else {
    if (_.isBoolean(value)) {
      return '-' + key + ' ';
    } else {
      return '-' + key + ' ' + value + ' ';
    }
  }
};

module.exports = createArgs;