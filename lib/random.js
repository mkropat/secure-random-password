'use strict';

var secureRandom = require('secure-random');

var util = require('./util');

function Random(randomSource) {
  if (typeof randomSource !== 'function') {
    throw new Error('Must pass a randomSource function');
  }
  this._randomSource = randomSource;
}

Random.prototype.choose = function (choices) {
  if (!choices || !choices.length) {
    throw new Error('Must pass 1 or more choices');
  }

  return choices[this._getInt(choices.length)];
};

Random.prototype.getInt = function (upperBoundExclusive) {
  if (upperBoundExclusive === undefined) {
    throw new Error('Must pass an upper bound');
  }
  if (!util.isInteger(upperBoundExclusive)) {
    throw new Error('Upper bound must be a number');
  }
  if (upperBoundExclusive < 1) {
    throw new Error('Upper bound must be > 0');
  }

  return this._getInt(upperBoundExclusive);
};

Random.prototype._getInt = function (upperBoundExclusive) {
  if (upperBoundExclusive === 1) {
    return 0; // short-circuit to avoid calling _randomSource with `0`
  }

  var numBytes = Math.ceil(Math.log(upperBoundExclusive) / Math.log(256));
  var startOfBias = Math.pow(2, 8*numBytes) - Math.pow(2, 8*numBytes) % upperBoundExclusive;
  var randomNumber;
  do
  {
    randomNumber = byteArrayToInt(this._randomSource(numBytes));
  } while (randomNumber >= startOfBias);
  return randomNumber % upperBoundExclusive;
};

Random.prototype.shuffle = function (items) {
  items = Array.prototype.slice.call(items || []);
  var result = [];
  while (items.length) {
    result.push(items.splice(this._getInt(items.length), 1)[0]);
  }
  return result;
};

exports.Random = Random;

exports.default = new Random(secureRandom);

function byteArrayToInt(bytes) {
  bytes = bytes || [];

  var result = 0;
  var power = 1;
  for (var i = bytes.length - 1; i >= 0; i--) {
    result += bytes[i]*power;
    power *= 256;
  }
  return result;
}
