'use strict';

function assign() {
  var objects = toArray(arguments);
  var target = objects[0];
  var sources = objects.slice(1);

  sources
    .filter(function (source) { return !!source })
    .forEach(function (source) {
      Object.keys(source).forEach(function (key) {
        target[key] = source[key];
      });
    });

  return target;
}

exports.assign = assign;

function intersection(left, right) {
  left = toArray(left);
  right = toArray(right);

  var leftSet = {};
  left.forEach(function (k) {
    leftSet[k] = true;
  });
  var rightSet = {};
  right.forEach(function (k) {
    rightSet[k] = true;
  });

  return Object.keys(leftSet).filter(function(k) {
    return Object.prototype.hasOwnProperty.call(rightSet, k);
  });
}

exports.intersection = intersection;

function isInteger(n) {
  return typeof n === 'number' && isFinite(n) && Math.floor(n) === n;
}

exports.isInteger = isInteger;

function isString(s) {
  return typeof s === 'string' || s instanceof String;
}

exports.isString = isString;

function range(n) {
  return Array.apply(null, Array(n)).map(function (x, i) { return i });
}

exports.range = range;

function repeat(val, n) {
  return range(n).map(function () { return val });
}

exports.repeat = repeat;

function toArray(x) {
  return Array.prototype.slice.call(x);
}

exports.toArray = toArray;
